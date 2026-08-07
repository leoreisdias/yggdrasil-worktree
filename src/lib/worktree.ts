import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { GitWorktree, PrStatus } from './git.js';
import { YGG_ROOT } from './paths.js';
import { getSandboxMetaPath } from './sandbox.js';

export type WorktreeType = 'MAIN' | 'MANAGED' | 'SANDBOX' | 'LINKED';

export const WORKTREE_TYPE_ORDER: Record<WorktreeType, number> = {
    MAIN: 0,
    MANAGED: 1,
    SANDBOX: 2,
    LINKED: 3,
};

export function getWorktreeBranchName(worktree: GitWorktree): string {
    return worktree.branch || worktree.HEAD || 'detached';
}

function isPathInsideRoot(worktreePath: string, managedRoot: string): boolean {
    const relative = path.relative(managedRoot, worktreePath);
    return relative === '' || Boolean(relative && !relative.startsWith('..') && !path.isAbsolute(relative));
}

export function isManagedWorktreePath(worktreePath: string, managedRoot = YGG_ROOT): boolean {
    return isPathInsideRoot(path.resolve(worktreePath), path.resolve(managedRoot));
}

export function formatWorktreeDisplayPath(worktreePath: string, managedRoot = YGG_ROOT): string {
    if (isManagedWorktreePath(worktreePath, managedRoot)) {
        return path.relative(managedRoot, worktreePath);
    }

    const home = process.env.HOME;
    if (home && worktreePath === home) return '~';
    if (home && worktreePath.startsWith(`${home}${path.sep}`)) {
        return path.join('~', path.relative(home, worktreePath));
    }
    return worktreePath;
}

function getPathSegments(worktreePath: string): string[] {
    return path.resolve(worktreePath).split(path.sep).filter(Boolean);
}

function normalizeSelector(value: string): string {
    return value.trim().toLowerCase();
}

function getBaseSelectors(worktree: GitWorktree, managedRoot: string): string[] {
    return [
        worktree.path,
        formatWorktreeDisplayPath(worktree.path, managedRoot),
        path.basename(worktree.path),
        worktree.branch || '',
        worktree.HEAD,
    ].filter(Boolean);
}

export function getWorktreeSelector(
    worktree: GitWorktree,
    worktrees: GitWorktree[],
    managedRoot = YGG_ROOT,
): string {
    const otherSelectors = new Set(
        worktrees
            .filter(candidate => candidate.path !== worktree.path)
            .flatMap(candidate => [
                ...getBaseSelectors(candidate, managedRoot),
                ...getPathSegments(candidate.path),
            ])
            .map(normalizeSelector),
    );

    const uniqueSegment = getPathSegments(worktree.path)
        .reverse()
        .find(segment => !otherSelectors.has(normalizeSelector(segment)));

    return uniqueSegment || worktree.path;
}

export function findWorktreeByName(worktrees: GitWorktree[], worktreeName: string, managedRoot = YGG_ROOT): GitWorktree | undefined {
    const trimmedName = worktreeName.trim();
    const exactPathMatches = worktrees.filter(worktree =>
        worktree.path === trimmedName ||
        (path.isAbsolute(trimmedName) && path.resolve(worktree.path) === path.resolve(trimmedName))
    );

    if (exactPathMatches.length === 1) {
        return exactPathMatches[0];
    }

    const normalizedName = normalizeSelector(trimmedName);
    const matches = worktrees.filter(worktree => {
        const selectors = [
            ...getBaseSelectors(worktree, managedRoot),
            getWorktreeSelector(worktree, worktrees, managedRoot),
            path.relative(managedRoot, worktree.path),
        ];
        return selectors.some(selector => normalizeSelector(selector) === normalizedName);
    });

    if (matches.length > 1) {
        const paths = matches.map(worktree => worktree.path).join(', ');
        throw new Error(`Worktree selector "${worktreeName}" is ambiguous. Matches: ${paths}. Use an exact path or a unique selector from "yggtree list".`);
    }

    return matches[0];
}

export async function detectWorktreeType(worktree: GitWorktree, mainWorktreePath: string, managedRoot = YGG_ROOT): Promise<WorktreeType> {
    const isManaged = isManagedWorktreePath(worktree.path, managedRoot);
    if (!isManaged) {
        return worktree.path === mainWorktreePath ? 'MAIN' : 'LINKED';
    }

    const hasSandboxMeta = await fs.pathExists(getSandboxMetaPath(worktree.path));
    const isSandboxBranch = (worktree.branch || '').startsWith('sandbox-');
    return hasSandboxMeta || isSandboxBranch ? 'SANDBOX' : 'MANAGED';
}

export function formatWorktreeType(type: WorktreeType): string {
    if (type === 'SANDBOX') return chalk.magenta('SANDBOX');
    if (type === 'MANAGED') return chalk.green('MANAGED');
    if (type === 'MAIN') return chalk.blue('MAIN   ');
    return chalk.cyan('LINKED ');
}

export function formatPrStatus(pr: PrStatus): string {
    switch (pr.label) {
        case 'MERGED':   return chalk.magenta(`#${pr.number} MERGED`);
        case 'APPROVED': return chalk.green(`#${pr.number} APPROVED`);
        case 'CHANGES':  return chalk.red(`#${pr.number} CHANGES`);
        case 'IN REVIEW': return chalk.yellow(`#${pr.number} IN REVIEW`);
        case 'DRAFT':    return chalk.dim(`#${pr.number} DRAFT`);
        case 'OPEN':     return chalk.cyan(`#${pr.number} OPEN`);
        case 'CLOSED':   return chalk.dim(`#${pr.number} CLOSED`);
        default:         return chalk.dim(`#${pr.number} ${pr.label}`);
    }
}
