import chalk from 'chalk';
import inquirer from 'inquirer';
import { GitWorktree, listWorktrees, removeWorktree, getRepoRoot, getLastActivity } from '../../lib/git.js';
import { getManagedWorktreesRoot } from '../../lib/global-config.js';
import { log, createSpinner, timeAgo } from '../../lib/ui.js';
import {
    detectWorktreeType,
    formatWorktreeDisplayPath,
    formatWorktreeType,
    findWorktreeByName,
    getWorktreeBranchName,
    isManagedWorktreePath,
} from '../../lib/worktree.js';

interface DeleteOptions {
    all?: boolean;
    yes?: boolean;
}

interface ResolveDeleteWorktreesOptions {
    includeAll: boolean;
    currentWorktreePath: string;
    mainWorktreePath?: string;
    managedRoot: string;
}

function resolveDeleteWorktrees(
    worktrees: GitWorktree[],
    targets: string[],
    options: ResolveDeleteWorktreesOptions,
): GitWorktree[] {
    const eligibleWts = worktrees.filter(wt => {
        const isMainWorktree = wt.path === options.mainWorktreePath;
        const isCurrentWorktree = wt.path === options.currentWorktreePath;
        if (isMainWorktree || isCurrentWorktree) return false;

        if (options.includeAll) {
            return true;
        }
        return isManagedWorktreePath(wt.path, options.managedRoot);
    });

    if (targets.length === 0) {
        return eligibleWts;
    }

    const resolvedPaths = new Set(
        targets
            .map(target => findWorktreeByName(worktrees, target, options.managedRoot))
            .filter((worktree): worktree is GitWorktree => Boolean(worktree))
            .map(worktree => worktree.path),
    );

    return eligibleWts.filter(worktree => resolvedPaths.has(worktree.path));
}

export async function deleteCommand(targets: string[] = [], options: DeleteOptions = {}) {
    try {
        const currentWorktreePath = await getRepoRoot();
        const worktrees = await listWorktrees();
        const managedRoot = await getManagedWorktreesRoot(currentWorktreePath);
        let showAll = options.all;
        const hasExplicitTargets = targets.length > 0;
        const isNonInteractive = process.env.CI === 'true' || !process.stdin.isTTY;

        if (showAll === undefined && !hasExplicitTargets) {
            if (isNonInteractive) {
                log.error('Non-interactive delete requires worktree names or --all.');
                log.dim('Try: yggtree delete <worktree> --yes');
                return;
            }

            const { includeExternal } = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'includeExternal',
                    message: 'Include external linked worktrees (outside the managed root)?',
                    default: false,
                },
            ]);
            showAll = includeExternal;
        }

        const includeAll = Boolean(showAll);
        const mainWorktreePath = worktrees[0]?.path;

        const deletableWts = resolveDeleteWorktrees(worktrees, targets, {
            includeAll,
            currentWorktreePath,
            mainWorktreePath,
            managedRoot,
        });

        if (deletableWts.length === 0) {
            if (hasExplicitTargets) {
                log.error(`No deletable worktrees matched: ${targets.join(', ')}`);
                log.dim(includeAll
                    ? 'Main and current worktrees are protected from deletion.'
                    : 'Use "yggtree delete --all <worktree> --yes" to include linked worktrees outside the managed root.');
                return;
            }

            log.info(includeAll
                ? 'No deletable linked worktrees found.'
                : 'No managed worktrees found to delete. Use "yggtree wt delete --all" to include external linked worktrees.');
            return;
        }

        let selectedPaths = deletableWts.map(wt => wt.path);
        const shouldPromptForSelection = !hasExplicitTargets && !(options.all === true && options.yes);

        if (shouldPromptForSelection) {
            const choices = await Promise.all(deletableWts.map(async (wt) => {
                const [activity, type] = await Promise.all([
                    getLastActivity(wt.path),
                    detectWorktreeType(wt, mainWorktreePath || '', managedRoot),
                ]);
                const branchName = getWorktreeBranchName(wt);
                const active = activity ? chalk.magenta(timeAgo(activity)) : chalk.dim('—');
                const displayPath = formatWorktreeDisplayPath(wt.path, managedRoot);
                return {
                    name: `${formatWorktreeType(type)} ${chalk.bold.yellow(branchName)} ${chalk.dim('·')} ${active} ${chalk.dim('·')} ${chalk.dim(displayPath)}`,
                    value: wt.path,
                };
            }));

            const answer = await inquirer.prompt([
                {
                    type: 'checkbox',
                    name: 'selectedPaths',
                    message: includeAll ? 'Select worktrees to delete:' : 'Select managed worktrees to delete:',
                    choices: choices,
                    pageSize: 10,
                },
            ]);
            selectedPaths = answer.selectedPaths;
        }

        if (!selectedPaths || selectedPaths.length === 0) {
            log.info('No worktrees selected.');
            return;
        }

        const count = selectedPaths.length;
        const names = selectedPaths.map((p: string) => formatWorktreeDisplayPath(p, managedRoot));

        if (!options.yes) {
            if (isNonInteractive) {
                log.error('Non-interactive delete requires --yes.');
                log.dim(`Try: yggtree delete ${targets.join(' ')} --yes`);
                return;
            }

            const { confirm } = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'confirm',
                    message: `Are you sure you want to delete ${count > 1 ? `${count} worktrees` : `"${names[0]}"`}?`,
                    default: false,
                },
            ]);

            if (!confirm) {
                log.info('Deletion aborted.');
                return;
            }
        }

        for (const wtPath of selectedPaths) {
            const worktreeName = formatWorktreeDisplayPath(wtPath, managedRoot);
            const spinner = createSpinner(`Deleting ${worktreeName}...`).start();
            try {
                await removeWorktree(wtPath);
                spinner.succeed(`Deleted worktree: ${worktreeName}`);
            } catch (e: any) {
                spinner.fail(`Failed to delete ${worktreeName}`);
                log.actionableError(e.message, `git worktree remove ${wtPath} --force`, wtPath, [
                    `Try running manually: git worktree remove ${wtPath} --force`,
                    'Check if any files in the worktree are open or locked',
                    'Try running yggtree wt prune to clean up git metadata'
                ]);
            }
        }

    } catch (error: any) {
        log.error(error.message);
        process.exit(1);
    }
}
