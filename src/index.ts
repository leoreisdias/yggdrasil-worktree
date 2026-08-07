import { Command, Option } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import path from 'path';
import { execa } from 'execa';
import {
    formatMainMenuChoice,
    renderMainMenuIntro,
    welcome,
    log,
} from './lib/ui.js';
import {
    applyHelp,
    checkoutHelp,
    createHelp,
    createMultiHelp,
    createSandboxHelp,
    deleteHelp,
    handoffHelp,
    intentRouterHelp,
    openHelp,
    unapplyHelp,
} from './lib/help.js';

import { listCommand } from './commands/wt/list.js';
import { createCommand } from './commands/wt/create.js';
import { createCommandNew } from './commands/wt/create-branch.js';
import { createCommandMulti } from './commands/wt/create-multi.js';
import { createSandboxCommand } from './commands/wt/create-sandbox.js';
import { deleteCommand } from './commands/wt/delete.js';
import { bootstrapCommand } from './commands/wt/bootstrap.js';
import { pruneCommand } from './commands/wt/prune.js';
import { execCommand } from './commands/wt/exec.js';
import { pathCommand } from './commands/wt/path.js';
import { openCommand } from './commands/wt/open.js';
import { applyCommand } from './commands/wt/apply.js';
import { unapplyCommand } from './commands/wt/unapply.js';
import { handoffCommand } from './commands/wt/handoff.js';
import { copyEnvCommand } from './commands/wt/copy-env.js';
import { updateCommand } from './commands/update.js';
import {
    configBootstrapCommand,
    configGetCommand,
    configResetCommand,
    configSetWorktreeLayoutCommand,
    configSetWorktreesRootCommand,
    configUseCommand,
} from './commands/config.js';
import { getVersion } from './lib/version.js';
import { checkForUpdate } from './lib/update-check.js';
import { findSandboxRoot } from './lib/sandbox.js';
import { bifrostCommand } from './commands/bifrost.js';
import { thorCommand } from './commands/thor.js';
import {
    buildMainMenuEntries,
    MainMenuAction,
    MainMenuContext,
} from './lib/main-menu.js';
import { getRepoRoot, listWorktrees } from './lib/git.js';

const program = new Command();
const argv = process.argv.map((arg) => arg === '-v' || arg === '—version' ? '--version' : arg);
const DOCS_URL = 'https://yggtree.logbookfordevs.com/docs';

function mainMenuChoice(
    value: MainMenuAction,
    glyph: string,
    label: string,
    detail: string,
    tone: Parameters<typeof formatMainMenuChoice>[0]['tone'],
) {
    return {
        name: formatMainMenuChoice({ glyph, label, detail, tone }),
        value,
    };
}

function mainMenuSeparator(label: string) {
    return new inquirer.Separator(chalk.dim(`  · ${label}`));
}

const mainMenuChoices: Record<MainMenuAction, ReturnType<typeof mainMenuChoice>> = {
    'create-smart': mainMenuChoice('create-smart', '◆', 'Grow new realm', 'create a branch-backed worktree', 'growth'),
    'worktree-checkout': mainMenuChoice('worktree-checkout', '⇄', 'Check out branch', 'open an existing ref in a new realm', 'travel'),
    handoff: mainMenuChoice('handoff', '✦', 'Hand off current work', 'carry dirty work into a named sandbox', 'sandbox'),
    open: mainMenuChoice('open', '◇', 'Open realm', 'jump into an existing worktree', 'travel'),
    list: mainMenuChoice('list', '○', 'Survey realms', 'scan active worktrees and PR state', 'tending'),
    'create-multi': mainMenuChoice('create-multi', '✧', 'Grow many realms', 'create multiple branch worktrees', 'growth'),
    'create-sandbox': mainMenuChoice('create-sandbox', '△', 'Forge sandbox', 'create a local experiment realm', 'sandbox'),
    bootstrap: mainMenuChoice('bootstrap', '↳', 'Bootstrap realm', 'run configured setup commands', 'tending'),
    exec: mainMenuChoice('exec', '⌁', 'Cast command', 'run a command inside a worktree', 'tending'),
    path: mainMenuChoice('path', '⌖', 'Reveal path', 'print a worktree cd command', 'tending'),
    'copy-env': mainMenuChoice('copy-env', '≋', 'Bring env files', 'copy local env files from main realm', 'tending'),
    delete: mainMenuChoice('delete', '×', 'Fell realm', 'delete managed worktrees', 'danger'),
    prune: mainMenuChoice('prune', '⌫', 'Prune stale realms', 'remove stale worktree metadata', 'danger'),
    apply: mainMenuChoice('apply', '◆', 'Graft sandbox changes', 'apply sandbox changes to origin', 'sandbox'),
    unapply: mainMenuChoice('unapply', '↶', 'Undo sandbox graft', 'restore origin from sandbox backups', 'sandbox'),
    bifrost: mainMenuChoice('bifrost', '✺', 'Summon the Bifrost', 'open the long way around', 'lore'),
    thor: mainMenuChoice('thor', 'ϟ', 'Consult Thor', 'ask the thunder route', 'lore'),
    docs: mainMenuChoice('docs', '?', 'Open docs', 'read the Yggtree documentation', 'tending'),
    exit: mainMenuChoice('exit', '·', 'Leave Yggdrasil', 'exit without changing anything', 'exit'),
};

async function detectMainMenuContext(): Promise<MainMenuContext> {
    if (await findSandboxRoot(process.cwd())) {
        return 'sandbox';
    }

    try {
        const repoRoot = await getRepoRoot();
        const worktrees = await listWorktrees();
        const mainWorktreePath = worktrees[0]?.path;

        if (mainWorktreePath && path.resolve(repoRoot) !== path.resolve(mainWorktreePath)) {
            return 'worktree';
        }
    } catch {
        return 'main';
    }

    return 'main';
}

async function openDocs() {
    const command = process.platform === 'darwin'
        ? 'open'
        : process.platform === 'win32'
            ? 'cmd'
            : 'xdg-open';
    const args = process.platform === 'win32'
        ? ['/c', 'start', '', DOCS_URL]
        : [DOCS_URL];

    try {
        await execa(command, args, { stdio: 'ignore' });
        log.success(`Opened docs: ${DOCS_URL}`);
    } catch {
        log.warning('Could not open the docs in your browser.');
        log.info(DOCS_URL);
    }
}

function registerWorktreeCommands(parent: Command) {
    parent.command('list')
        .description('List all repo-linked worktrees')
        .option('--open', 'Open a worktree in an IDE/agent tool instead of listing')
        .option('--json', 'Print structured worktree data as JSON')
        .action(async (options) => {
            if (options.open) {
                await openCommand();
                return;
            }
            await listCommand(options);
        });

    parent.command('create [branch]')
        .description('Create an official branch-backed task worktree')
        .option('-b, --branch <name>', 'Branch name (e.g. feat/new-ui)')
        .option('--base <ref>', 'Base ref (e.g. main)')
        .option('--source <type>', 'Base source (local or remote)')
        .option('--no-bootstrap', 'Skip configured bootstrap commands')
        .option('--open', 'Open an editor after creation')
        .option('--no-open', 'Skip opening an editor after creation')
        .option('--enter', 'Enter the worktree sub-shell after creation')
        .option('--no-enter', 'Do not enter the worktree sub-shell after creation')
        .option('--exec <command>', 'Command to execute after creation')
        .option('--config <preset>', 'Use a path preset for this run only (yggtree, codex, claude)')
        .addHelpText('after', createHelp)
        .action(async (branch, options) => {
            await createCommandNew({
                ...options,
                branch: branch || options.branch
            });
        });

    parent.command('create-multi')
        .description('Bulk-create official branch-backed worktrees')
        .option('--base <ref>', 'Base ref (e.g. main)')
        .option('--source <type>', 'Base source (local or remote)')
        .option('--no-bootstrap', 'Skip configured bootstrap commands')
        .option('--config <preset>', 'Use a path preset for this run only (yggtree, codex, claude)')
        .addHelpText('after', createMultiHelp)
        .action(async (options) => {
            await createCommandMulti(options);
        });

    const registerWorktreeCheckout = (commandName: string, description: string) => {
        parent.command(`${commandName} [name] [ref]`)
            .description(description)
            .option('-n, --name <slug>', 'Worktree name (slug)')
            .option('-r, --ref <ref>', 'Existing branch or ref')
            .option('--no-bootstrap', 'Skip configured bootstrap commands')
            .option('--open', 'Open editors or run a startup command before entering')
            .option('--no-open', 'Skip opening editors or startup commands before entering')
            .option('--tool <command>', 'Editor, app, or terminal command to open after checkout (skips open prompt)')
            .addOption(new Option('--enter', 'Enter the worktree sub-shell after checkout/opening').hideHelp())
            .option('--no-enter', 'Do not enter the worktree sub-shell after checkout/opening')
            .option('--exec <command>', 'Command to execute after creation')
            .option('--config <preset>', 'Use a path preset for this run only (yggtree, codex, claude)')
            .addHelpText('after', checkoutHelp)
            .action(async (name, ref, options) => {
                await createCommand({
                    ...options,
                    name: name || options.name,
                    ref: ref || options.ref
                });
            });
    };

    registerWorktreeCheckout('worktree-checkout', 'Create a checkout-style worktree from an existing branch');
    registerWorktreeCheckout('wc', 'Alias for worktree-checkout');

    parent.command('delete [worktrees...]')
        .description('Delete managed worktrees')
        .option('-a, --all', 'Include external LINKED worktrees outside the managed root (except main/current)')
        .option('-y, --yes', 'Confirm deletion without prompts')
        .addHelpText('after', deleteHelp)
        .action(async (worktrees, options) => {
            await deleteCommand(worktrees, options);
        });

    parent.command('open [worktree]')
        .description('Open a worktree in an editor, supported app, or terminal target')
        .option('--tool <command>', 'Editor, app, or terminal command to use (e.g. cursor, code, codex-app, tmux)')
        .option('--enter', 'Enter the worktree sub-shell after opening')
        .addOption(new Option('--no-enter', 'Do not enter the worktree sub-shell after opening').hideHelp())
        .addHelpText('after', openHelp)
        .action(async (worktree, options) => {
            await openCommand(worktree, options);
        });

    parent.command('bootstrap')
        .description('Bootstrap dependencies in a worktree')
        .action(bootstrapCommand);

    parent.command('prune')
        .description('Prune stale worktree information')
        .action(pruneCommand);

    parent.command('exec')
        .description('Execute a command in a worktree')
        .argument('[worktree]', 'Worktree name or path')
        .argument('[command...]', 'Command and arguments to execute')
        .action(async (worktree, command) => {
            await execCommand(worktree, command);
        });

    parent.command('path [worktree]')
        .description('Show the cd command for a specific worktree')
        .action(async (worktree) => {
            await pathCommand(worktree);
        });

    parent.command('copy-env')
        .description('Copy local env files from the main worktree to the current worktree')
        .action(copyEnvCommand);

    parent.command('create-sandbox')
        .description('Create a local-only disposable experiment sandbox')
        .option('-n, --name <name>', 'Optional sandbox name (auto-generated when omitted)')
        .option('--carry', 'Copy uncommitted changes to sandbox')
        .option('--no-carry', 'Do not copy uncommitted changes')
        .option('--no-bootstrap', 'Skip configured bootstrap commands')
        .option('--open', 'Open an editor after creation')
        .option('--no-open', 'Skip opening an editor after creation')
        .addOption(new Option('--enter', 'Deprecated alias for --open').hideHelp())
        .addOption(new Option('--no-enter', 'Deprecated alias for --no-open').hideHelp())
        .option('--exec <command>', 'Command to execute after creation')
        .option('--config <preset>', 'Use a path preset for this run only (yggtree, codex, claude)')
        .addHelpText('after', createSandboxHelp)
        .action(async (options) => {
            await createSandboxCommand(options);
        });

    parent.command('handoff')
        .description('Carry dirty current work into a named sandbox')
        .option('-n, --name <name>', 'Optional handoff name (prompted when omitted)')
        .option('--no-bootstrap', 'Skip configured bootstrap commands')
        .option('--open', 'Open an editor after creation')
        .option('--no-open', 'Skip opening an editor after creation')
        .addOption(new Option('--enter', 'Deprecated alias for --open').hideHelp())
        .addOption(new Option('--no-enter', 'Deprecated alias for --no-open').hideHelp())
        .option('--exec <command>', 'Command to execute after creation')
        .option('--config <preset>', 'Use a path preset for this run only (yggtree, codex, claude)')
        .addHelpText('after', handoffHelp)
        .action(async (options) => {
            await handoffCommand(options);
        });

    parent.command('apply')
        .description('Copy sandbox file changes to the origin checkout')
        .addHelpText('after', applyHelp)
        .action(applyCommand);

    parent.command('unapply')
        .description('Restore origin files from sandbox apply backups')
        .addHelpText('after', unapplyHelp)
        .action(unapplyCommand);
}

function rejectUnknownTopLevelCommand(args: string[]) {
    const commandArg = args.slice(2).find(arg => !arg.startsWith('-'));
    if (!commandArg) return;
    if (commandArg === 'help') return;

    const knownCommands = new Set(
        program.commands.flatMap(command => [command.name(), ...command.aliases()])
    );
    if (!knownCommands.has(commandArg)) {
        program.error(`error: unknown command '${commandArg}'`);
    }
}

program
    .name('yggtree')
    .description('Interactive CLI for managing git worktrees and configs')
    .version(getVersion())
    .allowExcessArguments(false)
    .addHelpText('after', intentRouterHelp)
    .action(async () => {
        const update = await checkForUpdate();
        await welcome({ update });
        const menuContext = await detectMainMenuContext();
        const choices = buildMainMenuEntries(menuContext).map((entry) => {
            if (entry.type === 'separator') {
                return mainMenuSeparator(entry.label);
            }

            return mainMenuChoices[entry.value];
        });

        console.log(renderMainMenuIntro({ context: menuContext }));
        const { action } = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'Which route should Yggtree follow?',
                loop: false,
                pageSize: 14,
                choices,
            },
        ]);

        switch (action) {
            case 'create-smart':
                await createCommandNew({ bootstrap: true });
                break;
            case 'create-multi':
                await createCommandMulti({ bootstrap: true });
                break;
            case 'worktree-checkout':
                await createCommand({ bootstrap: true });
                break;
            case 'list':
                await listCommand();
                break;
            case 'open':
                await openCommand();
                break;
            case 'delete':
                await deleteCommand();
                break;
            case 'bootstrap':
                await bootstrapCommand();
                break;
            case 'prune':
                await pruneCommand();
                break;
            case 'exec':
                await execCommand();
                break;
            case 'path':
                await pathCommand();
                break;
            case 'copy-env':
                await copyEnvCommand();
                break;
            case 'apply':
                await applyCommand();
                break;
            case 'unapply':
                await unapplyCommand();
                break;
            case 'create-sandbox':
                await createSandboxCommand({ bootstrap: true });
                break;
            case 'handoff':
                await handoffCommand({ bootstrap: true });
                break;
            case 'bifrost':
                await bifrostCommand();
                break;
            case 'thor':
                await thorCommand();
                break;
            case 'docs':
                await openDocs();
                break;
            case 'exit':
                log.info('Bye! 👋');
                process.exit(0);
        }
    });

// --- Worktree Commands ---
const wt = program.command('wt').description('Manage git worktrees');
wt.addHelpText('after', intentRouterHelp);
registerWorktreeCommands(program);
registerWorktreeCommands(wt);
program.addHelpCommand(true);

program.command('update')
    .description('Install the latest Yggtree release')
    .action(updateCommand);

program.command('bifrost')
    .description('Summon the Bifrost (Easter Egg)')
    .action(bifrostCommand);

program.command('thor')
    .description('Consult the God of Thunder (Easter Egg)')
    .action(thorCommand);

const config = program.command('config').description('Inspect or update global Yggtree settings');
config.command('get')
    .description('Show resolved global settings')
    .action(configGetCommand);
config.command('use <preset>')
    .description('Use a global worktree path preset (default, yggtree, codex, claude)')
    .action(configUseCommand);
config.command('set-worktrees-root <path>')
    .description('Set the global managed worktrees root')
    .action(configSetWorktreesRootCommand);
config.command('set-worktree-layout <layout>')
    .description('Set the managed worktree path layout (yggtree, codex, or claude)')
    .action(configSetWorktreeLayoutCommand);
config.command('bootstrap')
    .description('Set local worktree bootstrap commands in the current directory')
    .option('-c, --command <command>', 'Add a bootstrap command; repeat for multiple commands', (value, previous: string[] | undefined) => {
        return [...(previous ?? []), value];
    })
    .option('--clear', 'Remove local bootstrap commands from the current directory')
    .action(configBootstrapCommand);
config.command('reset')
    .description('Reset global settings to defaults')
    .action(configResetCommand);

rejectUnknownTopLevelCommand(argv);
program.parse(argv);
