<p align="center">
  <img src="docs/assets/yggtree-readme-hero.webp" alt="Yggdrasil's central tree branching into several isolated worktree realms, joined by gold paths" width="100%" />
</p>

<h1 align="center">Grow many worlds. Merge what matters.</h1>

<p align="center">
  <strong>Yggdrasil Worktree</strong> turns Git worktrees into clean, isolated environments for parallel development, reviews, experiments, and coding agents.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/yggtree"><img src="https://img.shields.io/npm/v/yggtree.svg" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/yggtree"><img src="https://img.shields.io/npm/l/yggtree.svg" alt="license" /></a>
  <a href="https://yggtree.logbookfordevs.com/docs"><strong>Read the docs →</strong></a>
</p>

Run the interactive CLI to create, bootstrap, enter, and manage one worktree realm per task—without disturbing the work already in progress.

---

## 🚀 Quick Start

### Installation

Install the latest release:

```bash
curl -fsSL https://yggtree.logbookfordevs.com/install.sh | bash
```

Prefer npm globals? `npm install -g yggtree` still works.

Or try it without installing:

```bash
npx yggtree
```

### Agent Skills

An agent skill is now available for your favorite agents.

`yggtree` ships one consolidated skill that helps agents choose the right
worktree workflow first, then load the smallest reference they need:

* **Create a task worktree**: start a brand-new branch-backed task in parallel.
* **Branch off without stashing**: jump into another branch without disturbing
  the work already in progress.
* **Bootstrap and use a realm**: prepare a worktree, open it in your IDE, or
  run commands inside it.
* **Run sandbox experiments**: try alternative approaches locally, then copy the
  winner back with sandbox-backed apply/unapply.

This skill is especially useful with agents like **Claude Code**,
**Codex**, **Cursor**, **Gemini CLI**, and other tools that support the open
Skills ecosystem.

Install it with the Skills CLI:

```bash
npx skills add logbookfordevs/yggdrasil-worktree
```

Install it globally for your user:

```bash
npx skills add logbookfordevs/yggdrasil-worktree --global
```

Install only the consolidated `yggtree` skill:

```bash
npx skills add logbookfordevs/yggdrasil-worktree --skill yggtree
```

If your agent supports targeted installs, you can also point the install to a
specific agent runtime, for example:

```bash
npx skills add logbookfordevs/yggdrasil-worktree --agent codex
```

### Basic Usage

Run with no arguments to open the interactive menu:

```bash
yggtree
```

Or use commands directly:

```bash
yggtree create
yggtree list
yggtree wc --ref my-feature
yggtree -v
```

The older `yggtree wt ...` form still works for compatibility, but direct commands are the preferred shape.

---

## 🧠 Mental Model

Yggdrasil is built around a few core ideas:

* **Branches are ideas**
* **Worktrees are realities**
* **Each task deserves its own realm**

Instead of constantly switching branches in one working directory, Yggdrasil creates **isolated worktrees**, each mapped to a branch, living outside your main repo.

All managed worktrees live under:

```
~/.yggtree/<repo-name>/<worktree-slug>
```

This keeps your main repository clean while enabling true parallelism.
You can change the global managed worktree location with `yggtree config`.

---

## 🤔 Why Yggdrasil Worktree?

Git worktrees are powerful, but once you start doing **parallel work**, they become tedious to manage manually.

Modern development looks like this:

* Fixing a bug
* Reviewing a PR
* Prototyping a feature
* Letting AI agents explore refactors
* Running tests in isolation

All at the same time.

Yggdrasil exists to solve three problems together:

1. Parallel work without context collision
2. Fast, repeatable environment setup
3. Agent‑friendly isolation for AI workflows

Each worktree becomes its own **small realm**, safe to explore and easy to discard.

---

## ✨ Key Features

🌳 **First-class worktree workflow**
Create, manage, and navigate Git worktrees as a primary workflow, not an afterthought.

🧠 **Parallel development by default**
Work on multiple branches at the same time, each in its own isolated environment.

🧪 **Sandbox worktrees for experimentation**
Prototyping something risky? Create a sandbox, try different strategies, and copy the winner back to your origin checkout.

🤝 **Handoff current work**
Started in your main checkout? Carry staged, unstaged, and untracked work into a named sandbox worktree and continue there.

🤖 **AI-friendly isolation**
One worktree per agent, per experiment, per idea. No shared state, no collisions.

⚡ **Configurable bootstrapping**
Run project setup commands for each worktree when configured.

🚪 **Enter, exec, and exit with ease**
Enter worktrees, execute commands, or run tasks without changing directories.

📍 **Predictable structure**
Managed worktrees default to `~/.yggtree`, with an optional global path setting for agent-native layouts.

🧭 **Interactive or scriptable**
Use the interactive UI or drive everything through commands and flags.

---

## 🧠 Parallel Development, Done Right

```bash
yggtree create feat/city-selection
yggtree create fix/validation
yggtree create chore/cleanup-api
```

Each command creates:

* A clean folder
* A dedicated branch
* Optional bootstrap setup when configured

No stash juggling.
No branch confusion.
No shared state accidents.

---

## 🤖 Built for AI‑Assisted Workflows

Yggdrasil shines when paired with AI agents.

Instead of running agents against the same directory, you can assign **one worktree per agent**.

```bash
yggtree create feat/ai-refactor-a --exec "cursor ."
yggtree create feat/ai-refactor-b --exec "codex"
```

Each agent operates in its own realm:

* Model A refactors architecture
* Model B focuses on tests
* Model C explores performance

All in parallel. All reviewable. All isolated.

---

## 🧪 Sandbox Worktrees

Sometimes you don't want to "commit to a branch" yet. You just want to try something out—or perhaps try three different ways of solving the same problem.

**Sandboxes** are temporary, local-only worktrees designed for this:

1.  **Create**: `yggtree create-sandbox` (creates something like `sandbox-a3f2_feature-branch`).
2.  **Experiment**: Change files, run tests, try that risky refactor.
3.  **Apply**: `yggtree apply` to copy changed sandbox files back to your origin directory with backups.
4.  **Unapply**: Don't like it? `yggtree unapply` restores those backed-up origin files while the sandbox still exists.

Sandboxes are **not pushed to remote**. Omit the name for a generated temporary sandbox, or provide one when the work needs to be easy to find later.

Use `handoff` when you started in the origin checkout and want to continue that dirty work in a sandbox. This is the taught path for staged, unstaged, or untracked work:

```bash
yggtree handoff --name auth-refactor
```

---

## ⚡ Bootstrapping & Configuration

Yggdrasil can prepare each worktree with configured setup commands. If no bootstrap config is found, it skips setup and prints a small tip.
The first interactive create flow in a repo offers to create `.yggtree/worktree-setup.json`; declining skips the offer on later runs.

Resolution order:

1. `.yggtree/worktree-setup.json` in the repo root
2. `yggtree-worktree.json` in the repo root (legacy fallback)
3. `.cursor/worktrees.json` in the repo root (legacy fallback)
4. `.yggtree/worktree-setup.json` inside the worktree (per-worktree fallback)
5. `yggtree-worktree.json` inside the worktree (legacy fallback)
6. `.cursor/worktrees.json` inside the worktree (legacy fallback)
7. No setup commands

### Example configuration

```json
{
  "setup-worktree": [
    "pnpm install",
    "git submodule sync --recursive",
    "git submodule update --init --recursive",
    "echo \"Realm ready\""
  ]
}
```

Create local setup config in the current directory interactively:

```bash
yggtree config bootstrap
```

Or create it non-interactively:

```bash
yggtree config bootstrap --command "pnpm install" --command "pnpm test"
```

Clear local setup config from the current directory:

```bash
yggtree config bootstrap --clear
```

---

## 🗂️ Global Worktree Paths

By default, managed worktrees use the Yggtree layout:

```bash
~/.yggtree/<repo-name>/<worktree-slug>
```

Show the active global setting:

```bash
yggtree config get
```

Use the Codex-style layout when you want Yggtree-created worktrees to live under Codex's worktree root:

```bash
yggtree config use codex
```

That preset creates new managed worktrees like:

```bash
~/.codex/worktrees/<worktree-slug>/<repo-name>
```

Use the Claude Code layout when you want Yggtree-created worktrees to match Claude's native repo-local worktree directory:

```bash
yggtree config use claude
```

That preset creates new managed worktrees like:

```bash
<repo-root>/.claude/worktrees/<worktree-slug>
```

Set a custom managed root while keeping the Yggtree layout:

```bash
yggtree config set-worktrees-root ~/Worktrees
```

Return to defaults:

```bash
yggtree config reset
```

Use a path preset for one worktree without changing the saved global config:

```bash
yggtree create feat/agent-native --config claude
yggtree wc --ref main --name fresh-main --config yggtree
```

Cursor does not currently have a confirmed native worktree directory pattern in Yggtree. Until that is explicit, use `set-worktrees-root` with the directory you want rather than relying on an unverified preset.

---

## 🛠️ Command Reference

### `yggtree`

Open the interactive menu.

---

### `yggtree create [branch]`

Create a worktree from a branch.

Options:

* `-b, --branch <name>`
* `--base <ref>`
* `--source local|remote`
* `--no-bootstrap`
* `--open / --no-open`
* `--enter / --no-enter`
* `--exec "<command>"`
* `--config <preset>`: use `yggtree`, `codex`, or `claude` path settings for this run only

Interactive flow:

* Instead of asking for a free-form `exec` command, yggtree now asks if you want to open an editor after creation.
* After creation, yggtree enters the new worktree shell unless you pass `--no-enter`.
* `--exec` remains available as an advanced explicit override.

<details>
<summary>Example</summary>

```bash
yggtree create feat/new-ui --base main --exec "cursor ."
```

</details>

---

### `yggtree worktree-checkout [name] [ref]`

Create a checkout-style worktree from an existing branch.

Behavior:

* Prompts a searchable branch picker (type to filter in real time).
* Attaches the new worktree directly to the selected branch (checkout-style).
* If a branch exists both locally and on `origin`, the picker shows both `branch` (local) and `origin/branch` (remote tip, detached) as explicit choices.
* If you select a remote-only branch (`origin/*`), yggtree creates the local branch in the new worktree automatically.
* If that branch already has an active worktree, yggtree falls back to using that worktree instead of creating a duplicate.
* By default, yggtree ends the flow inside the worktree shell.
* `yggtree wc` is a short alias for the same flow.

Options:

* `-n, --name <slug>`
* `-r, --ref <ref>`: skip picker and use a specific branch (`feature/x` or `origin/feature/x`)
* `--no-bootstrap`
* `--open / --no-open`: choose whether to open editors or run a startup command before the worktree shell starts
* `--tool <command>`: open a specific editor, app, or terminal target and skip the open prompt (`cursor`, `code`, `codex-app`, `cmux`, `tmux`)
* `--no-enter`: finish after create/open and return to the caller
* `--exec "<command>"`
* `--config <preset>`: use `yggtree`, `codex`, or `claude` path settings for this run only

Interactive flow:

* Yggtree asks what to open before starting the worktree shell.
* Shell-entry flows use a single action picker, so pressing Enter on Cmux or Tmux chooses that terminal target directly.
* Plain `yggtree open` flows use the same single action picker and return after opening the selected target.
* Use `--tool` to skip the open prompt and launch one editor/app or terminal target directly.
* Cmux, Tmux, and `Other command...` are mutually exclusive because the open picker accepts one action.
* `Other command...` runs a command in the Yggtree shell first, then leaves you there.
* Use `--no-enter` when you only want the worktree created/opened and the command to return.
* `--exec` remains available as an advanced explicit override.

<details>
<summary>Example</summary>

```bash
yggtree worktree-checkout -n hotfix-auth -r main --no-open
yggtree wc hotfix-auth main --open
yggtree wc hotfix-auth main --tool codex-app
yggtree wc hotfix-auth main --open --no-enter
```

</details>

---

### `yggtree create-sandbox`

Create a temporary local-only sandbox from your current branch.

Options:

*   `-n, --name <name>`: Optional sandbox name (auto-generated if omitted).
*   `--carry / --no-carry`: Explicitly choose whether to copy uncommitted changes into the sandbox. Prefer `handoff` when the intent is continuing dirty work.
*   `--no-bootstrap`
*   `--open / --no-open`
*   `--exec "<command>"`
*   `--config <preset>`: use `yggtree`, `codex`, or `claude` path settings for this run only

Interactive flow:

* Prompts for an optional sandbox name (leave empty to auto-generate one from current branch).
* Instead of asking for a free-form `exec` command, yggtree now asks if you want to open an editor after creation.
* `--exec` remains available as an advanced explicit override.

---

### `yggtree handoff`

Carry uncommitted work from the current checkout into a sandbox worktree.

Options:

*   `-n, --name <name>`: Optional handoff name (prompted when omitted).
*   `--no-bootstrap`
*   `--open / --no-open`
*   `--exec "<command>"`
*   `--config <preset>`: use `yggtree`, `codex`, or `claude` path settings for this run only

This is the continuation-focused semantic path for dirty work. It uses sandbox metadata and apply/unapply behavior, but defaults to carrying staged, unstaged, and untracked files.

---

### `yggtree apply`

Copy changed files from the current sandbox back to the origin checkout.
*   **Backs up** origin files in sandbox metadata before overwriting.
*   **Offers to delete** the sandbox after applying.
*   **Is not a Git merge**: review the origin diff after applying, especially when deletions are involved.

---

### `yggtree unapply`

Undo a previous `apply` operation.
*   Restores origin files from the sandbox's backup metadata.
*   *Note: Only works if the sandbox worktree still exists.*

---

### `yggtree create-multi`

Create multiple official branch-backed worktrees at once. This is a bulk setup
command; it does not have the full `create` lifecycle flags such as `--open`,
`--enter`, or `--exec`.

Options:

* `--base <ref>`
* `--source local|remote`
* `--no-bootstrap`
* `--config <preset>`: use `yggtree`, `codex`, or `claude` path settings for this run only

<details>
<summary>Example</summary>

```bash
yggtree create-multi --base main
```

</details>

---

### `yggtree list`

List all repo-linked worktrees with state.

Columns:

* TYPE (`MAIN`, `MANAGED`, `LINKED`, `SANDBOX`)
* STATE (clean / dirty)
* LAST ACTIVE
* PR (optional — requires [GitHub CLI](https://cli.github.com/))
* BRANCH

Notes:

* Entries are grouped by `TYPE`.
* `SANDBOX` and `MANAGED` are worktrees inside the configured managed worktree root.
* External worktrees are labeled `LINKED`.
* Use `--open` to switch this flow into "pick and open in tool" mode.
* The **PR** column shows the pull request status for each branch (e.g. `OPEN`, `IN REVIEW`, `APPROVED`, `MERGED`, `DRAFT`, `CHANGES`). It only appears when `gh` CLI is installed and authenticated — otherwise it's silently omitted.

---

### `yggtree open [worktree]`

Open a worktree in an editor, supported desktop app, or terminal target.

Behavior:

* If `[worktree]` is omitted, you can pick from the worktree list with type-to-filter search.
* Detects available editor commands in your `PATH` (for example: `cursor`, `code`, `zed`, `webstorm`).
* Detects Codex App on macOS and launches the selected worktree with `codex app <path>`.
* Detects Cmux and Tmux when their CLI commands are available.
* Lets you choose one editor, app, or terminal target interactively, or pass `--tool`.
* Keeps Cmux, Tmux, and `Other command...` mutually exclusive by using a single action picker.
* By default, `open` launches the selected target and returns, except foreground terminal targets such as Tmux.
* Use `wc --open` when you want to open a worktree and continue in its shell.

Options:

* `--tool <command>` (for example: `cursor`, `code`, `codex`, `codex-app`, `cmux`, or `tmux`)

<details>
<summary>Examples</summary>

```bash
yggtree open
yggtree open feat/new-ui --tool cursor
yggtree open feat/new-ui --tool codex-app
yggtree open feat/new-ui --tool tmux
yggtree list --open
```

</details>

---

### `yggtree exec [worktree] -- <command>`

Run a command inside a worktree without changing your current terminal.

<details>
<summary>Example</summary>

```bash
yggtree exec feat/new-ui -- npm test
```

</details>

---

### `yggtree path [worktree]`

Print a `cd` command for a worktree.

Useful for scripting and shell aliases.

---

### `yggtree bootstrap`

Re‑run bootstrap commands for a worktree.

---

### `yggtree config bootstrap`

Set local bootstrap commands in `.yggtree/worktree-setup.json` under the current directory.

---

### `yggtree delete [worktrees...]`

Delete worktrees interactively or by explicit name.

Behavior:

* Default flow targets managed worktrees.
* In interactive mode, yggtree asks whether to include external linked worktrees.
* In direct CLI usage, `--all` includes external worktrees labeled `LINKED` in `yggtree list` (main/current are still excluded for safety).
* Non-interactive deletion requires explicit targets or `--all`, plus `--yes`.
* The delete selector shows 6 items per page.

Optional:

* `--all` includes external worktrees outside the configured managed root (main/current worktree is excluded for safety)
* `-y, --yes` confirms deletion without prompts

Examples:

```bash
yggtree delete my-feature --yes
yggtree delete my-feature other-feature --yes
yggtree delete external-feature --all --yes
yggtree delete --all --yes
```

---

### `yggtree prune`

Clean up stale git worktree metadata.

---

## 🌱 When Should You Use Yggdrasil?

Yggdrasil is ideal when:

* You work on multiple tasks in parallel
* You use AI agents for exploration
* You want isolation without duplication
* You value scripted, repeatable setups
* `git checkout` no longer scales

---

## 📝 Practical Examples

<details>
<summary>Create a worktree with the guided post-create flow</summary>

**Command:**

```
yggtree create feat/login-flow
```

**What happens:**

* Creates a new branch if it doesn’t exist (without inheriting base tracking), then publishes it to `origin` when possible
* Creates a dedicated worktree
* Runs bootstrap if enabled
* Lets you choose whether to open an editor after creation


</details>
---

<details>
<summary>Create a worktree without bootstrap, opening a tool, or entering</summary>

**Command:**

```
yggtree create feat/cleanup-api --no-bootstrap --no-open --no-enter
```

**When to use:**

* You just want the folder ready
* You’ll open it or move into its shell later if needed
* You don’t want installs running automatically

</details>
---

<details>
<summary>Create a worktree and open it in your IDE</summary>

**Command:**

```
yggtree create feat/ui-refactor --exec "cursor ."
```

Works with:

* `cursor .`
* `code .`
* Any custom command available in your shell

</details>
---

<details>
<summary>Execute a command inside an existing worktree (no shell)</summary>

**Command:**

```
yggtree exec test -- npm test
```

**What this does:**

* Runs the command inside the selected worktree
* Keeps your current terminal where it is
* Ideal for CI-like checks, scripts, or quick validations

</details>
---

<details>
<summary>Checkout a branch and run a startup command</summary>

**Command:**

```
yggtree wc --ref test --open
```

**What happens:**

* Checks out or reuses the branch worktree
* Lets you choose an editor, supported app, or `Other command...`
* Starts a worktree shell unless you pass `--no-enter`
* Type `exit` to return to your original directory

</details>
---

<details>
<summary>Get the path to a worktree</summary>

**Command:**

```
yggtree path test
```

**Output:**

```
cd ~/.yggtree/your-repo-name/test
```

Useful when you want to manually navigate or copy the path into scripts.

</details>

---

<details>
<summary>Try a risky refactor in a Sandbox</summary>

**Command:**

```bash
yggtree handoff --name risky-refactor
```

**Scenario:**

1.  You have 5 files changed in your main repo but aren't sure about the direction.
2.  Run `handoff --name risky-refactor` to carry those changes into an isolated `sandbox-risky-refactor` folder.
3.  Experiment freely.
4.  If it works: `yggtree apply`.
5.  If it fails after applying: run `yggtree unapply` before deleting the sandbox.

</details>

---

## 🌍 Philosophy

Branches are ideas.
Worktrees are realities.

Yggdrasil helps you grow many worlds and decide later which ones deserve to merge.

---

## 📄 License

MIT License.
