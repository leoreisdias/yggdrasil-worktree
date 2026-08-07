import chalk from 'chalk';
import { listWorktrees, getRepoRoot, isGitClean, getLastActivity, isGhAvailable, getPrStatusBatch, PrStatus } from '../../lib/git.js';
import { getManagedWorktreesRoot } from '../../lib/global-config.js';
import { log, timeAgo } from '../../lib/ui.js';
import {
    detectWorktreeType,
    formatWorktreeDisplayPath,
    formatWorktreeType,
    formatPrStatus,
    getWorktreeBranchName,
    getWorktreeSelector,
    WORKTREE_TYPE_ORDER,
} from '../../lib/worktree.js';

interface ListOptions {
    json?: boolean;
}

export async function listCommand(options: ListOptions = {}) {
    try {
        const repoRoot = await getRepoRoot(); // Verify we are in a git repo
        const worktrees = await listWorktrees();
        const mainWorktreePath = worktrees[0]?.path || '';
        const managedRoot = await getManagedWorktreesRoot(repoRoot);
        
        if (worktrees.length === 0) {
            log.info('No worktrees found.');
            return;
        }

        // Determine if PR status column should be shown
        const ghReady = await isGhAvailable();

        // Collect branch names for batch PR lookup
        const branches = worktrees.map(wt => getWorktreeBranchName(wt));
        const prStatusMap = ghReady ? await getPrStatusBatch(branches) : new Map<string, PrStatus>();
        const showPr = prStatusMap.size > 0;

        const rows = await Promise.all(worktrees.map(async (wt, index) => {
            const [typeKey, isClean, lastActive] = await Promise.all([
                detectWorktreeType(wt, mainWorktreePath, managedRoot),
                isGitClean(wt.path),
                getLastActivity(wt.path),
            ]);
            const type = formatWorktreeType(typeKey);
            const branchName = getWorktreeBranchName(wt);
            const selector = getWorktreeSelector(wt, worktrees, managedRoot);
            const displayPath = formatWorktreeDisplayPath(wt.path, managedRoot);
            const stateLabel = (isClean ? 'clean' : 'dirty').padEnd(8);
            const stateText = isClean ? chalk.green(stateLabel) : chalk.yellow(stateLabel);
            const activeLabel = lastActive ? timeAgo(lastActive) : '—';
            const activeText = chalk.magenta(activeLabel.padEnd(14));

            const prStatus = prStatusMap.get(branchName);
            const prText = showPr
                ? (prStatus ? formatPrStatus(prStatus).padEnd(24) : chalk.dim('—'.padEnd(14)))
                : '';

            return {
                text: `  ${type}  ${stateText} ${activeText} ${prText}${chalk.cyan(selector.padEnd(14))} ${chalk.yellow(branchName)}  ${chalk.dim(wt.path)}`,
                json: {
                    type: typeKey,
                    state: isClean ? 'clean' : 'dirty',
                    lastActive: lastActive?.toISOString() || null,
                    selector,
                    branch: wt.branch || null,
                    head: wt.HEAD,
                    path: wt.path,
                    displayPath,
                    pr: prStatus || null,
                },
                sortType: WORKTREE_TYPE_ORDER[typeKey],
                sortBranch: branchName.toLowerCase(),
                sortIndex: index,
            };
        }));

        const sortedRows = rows
            .sort((a, b) =>
                a.sortType - b.sortType ||
                a.sortBranch.localeCompare(b.sortBranch) ||
                a.sortIndex - b.sortIndex
            );

        if (options.json) {
            console.log(JSON.stringify(sortedRows.map(row => row.json), null, 2));
            return;
        }

        console.log(chalk.bold('\n  Active Worktrees:\n'));

        const headerPr = showPr ? `${chalk.dim('PR')}            ` : '';
        console.log(`  ${chalk.dim('TYPE')}    ${chalk.dim('STATE')}    ${chalk.dim('LAST ACTIVE')}     ${headerPr}${chalk.dim('SELECTOR')}       ${chalk.dim('BRANCH / HEAD')}  ${chalk.dim('PATH')}`);
        console.log(chalk.dim('  ' + '-'.repeat(showPr ? 130 : 110)));

        sortedRows.forEach(row => console.log(row.text));

        if (ghReady && !showPr) {
            console.log(chalk.dim('\n  ℹ No open PRs found for any worktree branch.'));
        } else if (!ghReady) {
            console.log(chalk.dim('\n  ℹ PR status omitted (gh CLI not found). Install GitHub CLI for PR tracking.'));
        }
        console.log('');
    } catch (error: any) {
        log.actionableError(error.message, 'yggtree wt list');
        process.exit(1);
    }
}
