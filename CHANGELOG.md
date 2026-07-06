# Changelog

All notable changes to this project will be documented in this file.

## Next Release - TBD

## [v1.5.0] - 2026-07-06

### Added
- `yggtree update` now installs the latest CLI release through the public release installer.
- `yggtree config bootstrap` now creates or clears local worktree setup commands in `.yggtree/worktree-setup.json`.
- The first interactive worktree create flow in a repo now offers to create `.yggtree/worktree-setup.json`.

### Changed
- Worktree bootstrap now skips setup when no repo or worktree bootstrap config exists instead of assuming `npm install` and submodule commands.
- Update notices now point to `yggtree update` instead of the npm global install command.

## [v1.4.7] - 2026-06-19

### Changed
- Website and README install docs now keep `npm install -g yggtree` visible as a quiet package-manager option alongside the release installer.

## [v1.4.6] - 2026-06-19

### Added
- `yggtree config use claude` now creates new managed worktrees in Claude Code's native repo-local `.claude/worktrees/<worktree-slug>` layout.
- Create-style commands now accept `--config <preset>` to use `yggtree`, `codex`, or `claude` path settings for one run without changing the saved global config.
- `yggtree delete` now supports non-interactive deletion with explicit worktree targets and `--yes`.
- The interactive lobby now includes an option to open the Yggtree documentation page.
- Create-style command help now calls out `--config claude` and `--config codex` for agent-native worktree layouts.

## [v1.4.5] - 2026-06-14

### Added
- Global `yggtree config` settings can now move managed worktrees out of `~/.yggtree`, including a Codex-style preset that creates new worktrees under `~/.codex/worktrees/<worktree-slug>/<repo-name>`.

### Changed
- Yggtree docs and packaged skill guidance now teach `handoff` as the default dirty-work sandbox path, clarify `create-sandbox` as disposable local experimentation, and describe `apply`/`unapply` as sandbox-backed file transfer rather than Git merge semantics.
- `yggtree --help` and nested command help now include compact intent routing and semantic guardrails so agents can choose between `create`, `wc`, `handoff`, `create-sandbox`, `apply`, and `create-multi` without loading the full skill.

### Fixed
- Opening Codex App from Yggtree now uses `codex app <path>` so the selected worktree opens as the active Codex project instead of only launching the desktop app.

## [v1.4.4] - 2026-06-06

### Added
- `open`, `wc`, and checkout open prompts now detect `cmux` and `tmux` CLI commands, offering Cmux panels or Tmux sessions as terminal targets when available.
- `--tool cmux` and `--tool tmux` can open a worktree directly in a Cmux panel or Tmux session without showing the open prompt.

### Changed
- Redesigned and polished the website docs page around a calmer Refined Grove direction, with a compact workflow chooser, quieter command blocks, clearer keyboard focus states, a more restrained desktop title scale, and less repetitive panel styling.
- Open-tool prompts now use a single-selection list without checkbox multi-select behavior or section separators, making Enter choose the highlighted action directly.
- `create` now enters the newly created worktree shell by default; use `--no-enter` when the command should create the worktree and return.

### Fixed
- Cmux open actions now create a focused right-side terminal pane, wait for the fresh terminal, and send `cd <worktree>` plus Enter to that explicit Cmux surface, avoiding accidental sends to the caller surface.
- Choosing Cmux or Tmux from a shell-entry open prompt no longer falls through into Yggtree's normal sub-shell.

## [v1.4.3] - 2026-06-01

### Added
- **Yggtree agent skill**: Added a consolidated `yggtree` skill with focused references for creating task worktrees, checking out existing branches without stashing, managing realm lifecycle commands, and running sandbox experiments.
- **Website and docs app**: Added the Yggtree website and docs experience.
- `yggtree wc` and `yggtree wt wc` now provide short aliases for the checkout-style `worktree-checkout` flow.
- `open` now detects Codex App on macOS and supports `--tool codex-app` / `--tool codex` to launch the selected worktree with the desktop app.
- `open` and checkout open prompts now detect Cmux and Tmux, offering `cmux` panels or `tmux` sessions when those terminal tools are available.

### Changed
- Worktree commands are now available directly at the top level, so users can run `yggtree list`, `yggtree create`, `yggtree worktree-checkout`, `yggtree delete`, and the rest of the worktree command set without the `wt` prefix.
- The older `yggtree wt ...` command shape remains available as a compatibility alias for existing scripts and muscle memory.
- Updated README and skill references to teach the direct command surface first, with `wt` documented as legacy-compatible behavior rather than the primary path.
- `worktree-checkout` now defaults to ending inside the worktree shell; use `--no-enter` to keep the command fire-and-forget.
- `worktree-checkout` / `wc` now accepts `--tool <command>` to open a specific editor/app after checkout while skipping the open prompt.
- `open` stays editor-focused and returns by default; use `--enter` when opening should continue into the worktree shell.
- Interactive open flows now use a single-action picker for editor/app launches, terminal targets, and `Other command...` when the flow will enter the normal Yggtree sub-shell.
- Interactive mode now checks npm for a newer `yggtree` release and points users to `npm install -g yggtree` when their installed CLI is behind.
- The open picker now uses a calmer Yggtree-styled left-rail layout with command labels and clearer shell/no-action choices.
- Agent CLIs are no longer first-class `open` options; use `Other command...` for custom foreground commands until the dedicated agent workflow lands.
- `wc` / `worktree-checkout` is now the primary path for branch-to-shell navigation, including non-interactive `--ref --name --no-open --no-enter` automation.
- Worktree creation flows now offer to copy local `.env` files into the new worktree before bootstrap runs. The copy is opt-in, skips example/template env files, and covers `create`, `worktree-checkout`, `create-multi`, and `create-sandbox`.
- README and website docs now lead with global installation, keep `npx yggtree` as a secondary option, and align examples with the current `wc` and `open` flows.
- Website docs now cover install, core workflows, command flags, sandbox guidance, configuration notes, and troubleshooting with improved readability on desktop and mobile.
- Tagged npm releases are now validated before publishing so release tags must match `package.json`, point at the current `main` tip, pass validation, and contain the expected package files.

### Removed
- Removed the public `enter` and `close` commands from the CLI, menus, and current docs. The shell-entry primitive remains internal for checkout and open flows.

### Fixed
- Cmux open actions now create a focused right-side terminal pane, wait for the fresh terminal, and send `cd <worktree>` plus Enter to that explicit Cmux surface, avoiding accidental sends to the caller surface.
- The open-action picker now prevents selecting multiple shell targets such as Cmux, Tmux, and `Other command...` in the same flow.
- Shell-entry open prompts now use a single-select picker so pressing Enter on Cmux or Tmux chooses that terminal target instead of submitting an empty checkbox selection and falling back to the sub-shell.
- Worktree creation commands no longer prompt for local `.env` copying in CI or other non-interactive runs, so scripted flows such as `--exec` continue without hanging when root `.env` files exist.
- `yggtree help` and `yggtree help <command>` now reach Commander’s help renderer instead of being rejected by the removed-command guard.
- `worktree-checkout` now shows both local and `origin/*` choices when a branch exists in both places, so users can explicitly choose the local branch or the remote tip.
- `worktree-checkout` now falls back to registered Yggtree repos when run outside a git repo, matching the shell-entry flow instead of failing immediately.
- `worktree-checkout` now exits with an actionable error instead of prompting when a non-interactive caller runs outside a repo with multiple registered repos.
- `worktree-checkout` now reuses any existing worktree for the selected branch, including linked worktrees outside the managed `~/.yggtree` directory, instead of trying to create a duplicate checkout.
- `worktree-checkout` now ignores prunable or missing-path worktree entries when deciding whether an existing checkout can be reused.

## [1.4.2] - 2026-03-15

### Changed
- `wt list` now shows a **PR** column with the pull request status for each worktree branch (e.g. `OPEN`, `IN REVIEW`, `APPROVED`, `MERGED`, `DRAFT`, `CHANGES`). Requires [GitHub CLI](https://cli.github.com/) — the column is silently omitted when `gh` is not installed.

### Fixed
- Interactive create flows now use `--open / --no-open` for post-create IDE/agent launching. `--enter / --no-enter` still works as a deprecated alias for backward compatibility.

## [1.4.1] - 2026-03-08

### Added
- Easter egg commands `bifrost` and `thor`.

## [1.4.0] - 2026-03-02

### Added
- `wt worktree-checkout`: checkout-style flow with searchable branch selection and branch-attached worktree creation (including remote-only branches).
- `wt open`: open a selected worktree in an IDE or agent CLI, with tool detection and interactive selection.
- `wt create-sandbox --name <name>`: optional explicit sandbox naming for CLI/scripted usage.

### Changed
- `wt list` now groups entries by `TYPE` for easier scanning.
- `wt list` and `wt delete` now share consistent type rules: only worktrees inside `~/.yggtree` are `MANAGED`/`SANDBOX`; external worktrees are labeled `LINKED` (with `MAIN` reserved for the primary repo worktree in `wt list`).
- Added `--all` support to `wt delete` so repo-linked worktrees outside `~/.yggtree` can be included when needed (with safety exclusions for main/current worktree).
- Interactive `wt delete` now asks whether to include external linked worktrees, so the menu flow can reach non-yggtree worktrees too.
- Increased `wt delete` menu pagination to show more options per page for better scanning.
- `wt worktree-checkout` now reuses an active managed yggtree worktree when the selected branch already has one.
- Core interactive menu now prioritizes `apply`/`unapply` when running inside a sandbox worktree.
- `wt list` now supports `--open` as a shortcut to the worktree tool-open flow.
- Interactive create flows (`wt create`, `wt worktree-checkout`, `wt create-sandbox`) now ask whether to open a tool after creation instead of asking for a free-form `exec` command by default.
- `wt create-sandbox` now prompts for an optional sandbox name; leaving it blank preserves the existing auto-generated naming behavior.
- `wt open` interactive selection now includes worktree type labels (`MAIN`, `MANAGED`, `SANDBOX`, `LINKED`) for consistency with `wt list` and `wt delete`.
- `wt open` now supports type-to-filter worktree selection, similar to `wt worktree-checkout`.

## [1.3.0] - 2026-02-18

### Added
- **Activity Tracking**: Added a `LAST ACTIVE` column to `wt list` showing relative time (e.g., "2 hours ago") based on last commit and git index activity.
- **`.yggtree/` config directory**: Bootstrap configuration is now read from `.yggtree/worktree-setup.json` (same `setup-worktree` schema). Legacy `yggtree-worktree.json` and `.cursor/worktrees.json` remain supported as fallbacks.
- **Sandbox metadata moved**: `.sandbox-meta.json` is now stored inside `.yggtree/sandbox-meta.json`. The `.yggtree/` directory is auto-created on first write.

### Changed
- Prefixed generated sandbox branch names with `sandbox-<hash>_` for better sorting and visibility (e.g., `sandbox-a3f2_feature`).
- Simplified `wt list` by removing the `PATH` column, as it typically duplicates the branch name in managed worktrees.
- Improved `wt delete` interactive selection by showing branch names and activity timestamps in a cleaner, standardized format.
- **Safer branch creation** (`wt create` / `wt create-multi`): Branches are now created with `git branch --no-track` before attaching the worktree, preventing Git from auto-tracking the base branch (e.g. `origin/main`). The branch is then auto-published to `origin` with correct upstream tracking. This fixes the root cause of accidental pushes to base branches while keeping the same convenient DX.
- **Config search order**: `repoRoot` is now checked before `wtPath` when resolving bootstrap config. This means edits to `.yggtree/worktree-setup.json` in your main repo take effect immediately on new worktrees, without needing to commit first. A worktree can still override by having its own `.yggtree/worktree-setup.json`.

### Fixed
- `wt apply` now excludes the entire `.yggtree/` directory from the changeset (previously only `.sandbox-meta.json` was excluded), preventing config and metadata files from leaking into the origin during sandbox apply.

## [1.2.1] - 2026-02-08

### Fixed
- Excluded `.sandbox-meta.json` from `wt apply` so sandbox bookkeeping does not get copied back to the origin worktree.

## [1.2.0] - 2026-02-08

### Added
- **🧪 Sandbox Worktrees**: A new workflow for local experimentation and prototyping.
- `wt create-sandbox`: Create a temporary worktree with a random name from the current local branch.
- `wt apply`: Apply differences from a sandbox worktree back to the origin directory with automatic backups.
- `wt unapply`: Revert changes applied to the origin using the sandbox's history.
- **Carry Support**: Option to carry over uncommitted (staged, unstaged, and untracked) changes when creating a sandbox.

## [1.1.1] - 2026-01-28

### Added
- **Strong Safety Mode**: New logic for worktree creation that prevents accidental pushes to base branches (like `main` or `development`).
- Automatic publishing: Newly created branches were automatically published to `origin` and set to track `origin/<branch-name>` instead of the base remote branch. *(In [1.3.0], branch creation was updated to use `--no-track` first, then publish explicitly to keep tracking safe.)*
- Upstream auditing: The tool now checks and unsets incorrect upstreams (e.g. tracking `origin/main` when it should track its own remote) upon creation.

### Changed
- Improved worktree creation workflow in both `wt create-branch` and `wt create-multi` to incorporate safety checks.

## [1.1.0] - 2026-01-27

### Added
- Improved list state column for clearer status visualization.
- Multi-deletion support: delete multiple worktrees at once.
- Post-creation hooks: run custom commands automatically using `exec`.
- Sub-shell integration: automatically enter the worktree environment upon creation.

## [1.0.0] - 2026-01-27

### Added
- Initial interactive TUI for worktree management (Yggdrasil Worktree).
- Core commands: `create`, `delete`, `list`, `bootstrap`, and `prune`.
- Support for bulk worktree creation (`create-multi`).
