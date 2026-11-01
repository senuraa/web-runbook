# Repository Guidelines

## Project Structure & Direction

WebRunbook is in discovery. Read `README.md` and `docs/project-brief.md`; distinguish proposals from implementation. `packages/` is empty; no source, tests, or assets exist. `nx.json` and `tsconfig.base.json` configure the workspace.

## Documentation & Feature Workflow

This is an open-source project developed with AI assistance. Keep contributor context in version-controlled documents:

- `docs/adrs/0001-<decision>.md`: centrally numbered architectural decision records (ADRs), including context, alternatives, the decision, consequences, and status.
- `docs/milestones/milestone-1-<name>/README.md`: milestone outcome, scope, and feature status.
- `docs/milestones/milestone-1-<name>/features/feature-1-<name>/design.md`: feature behavior, acceptance criteria, component responsibilities, interfaces, testing strategy, and links to applicable ADRs.
- `implementation-plan.md` beside each feature's `design.md`: small, independently testable behavioral work items and their status.

Current setup work belongs to [Milestone 1](docs/milestones/milestone-1/README.md), [Feature 1: Project setup](docs/milestones/milestone-1/features/feature-1-project-setup/design.md). Use `.gitkeep` to retain empty directories until documents replace the placeholders.

For each feature:

1. Brainstorm the problem, scope, alternatives, and acceptance criteria with the maintainer.
2. Record architectural decisions in ADRs, reusing existing ADRs where applicable.
3. Write the design document based on those decisions.
4. Obtain explicit maintainer approval of the design and its ADRs.
5. Brainstorm the implementation approach separately before writing code; design approval alone does not start implementation.
6. Break the design into small behavioral work items, ordered by dependencies and risk, and write the implementation plan.
7. Obtain explicit maintainer approval of the complete implementation plan once. Then implement its work items using TDD without requesting approval for each item.

Contributors and AI agents must read the relevant milestone, design, and ADRs before working. Keep proposals distinct from accepted decisions. Discuss and obtain approval for changes to approved requirements, designs, or ADRs before continuing affected implementation, and update the documents accordingly. Routine implementation choices within the approved scope do not require renewed approval.

## Behavioral Implementation Plans

Describe what the software must do using observable outcomes, inputs, results, failure cases, and concrete acceptance scenarios. Each work item must include its dependencies and links to the applicable design sections and ADRs. Prefer narrow behaviors spanning the components they need over completing entire technical layers first.

Plans must contain no implementation code, pseudocode, test code, prescribed function signatures, or class structures. Agents choose implementation details within the approved design and ADRs. This rule takes precedence over skill templates that embed code in plans.

Keep each item concise and understandable on its own. Link shared context instead of duplicating it; agents should load their assigned item, relevant design sections and ADRs, and the existing code needed for the change. Record completion and validation results as work progresses.

## Development Commands

Use `pnpm@12.16.1`:

- `pnpm install`: install dependencies and Husky hooks; use `pnpm run prepare` to reinstall hooks in an existing checkout.
- `pnpm nx show projects`: discover projects, including the root `repository` tooling project.
- `pnpm nx run repository:format`: format supported files with Oxfmt.
- `pnpm nx run repository:format-check`: check formatting without rewriting files.
- `pnpm nx run repository:lint`: run ESLint and the hard line-length check.
- `pnpm nx run <project>:<target>`: run an existing target.

No product build, test, or development targets exist yet. CI checks formatting and runs all available Nx `lint`, `typecheck`, `build`, `test`, `test-integration`, and `e2e` targets. Register new regression suites under these targets or extend CI when introducing another target; do not leave suites outside the full regression run.

## Coding Style & Naming

Use strict TypeScript, two-space indentation, and descriptive names. Oxfmt configures single quotes and a wrapping target of 120 characters. ESLint checks JavaScript and uses type-aware rules for TypeScript files included in a project tsconfig.

[ADR 0002](docs/adrs/0002-formatting-and-typescript-linting.md) records the implemented formatting and linting policy. Source, tests, and handwritten configuration have a hard 120-character line limit; documentation is exempt, and generated files and lockfiles are excluded. Use the recommended type-aware TypeScript lint baseline with the ADR's selected stricter rules. Pre-commit formats and lints staged files only, preserving unstaged work; tests, builds, and separate type checks stay out of the hook. Agents must fix hook failures rather than bypass them. CI independently enforces the complete checks. Keep ESLint and Oxfmt; reconsider Oxlint only if measured CI linting time becomes a bottleneck and required rule coverage is verified.

## Testing Guidelines

Use TDD for feature development and bug fixes. For each behavior:

1. Write a focused behavioral test and run it; confirm it fails because the behavior is missing or incorrect, not because of a broken test setup.
2. Write the minimum production code needed to pass, then run the test again.
3. Refactor while keeping tests green, and repeat for the next behavior.

Do not write the implementation before observing the failing test. Derive tests from the plan's acceptance criteria and assert observable behavior. Before marking an item complete, run the relevant project test suite and affected integration checks through Nx, and report any failures.

No framework, naming convention, or coverage threshold exists. Document these when adding tests. Use a local mock recruitment portal for browser testing.

CI must run the full available regression suite on every PR, including retained unit, integration, and browser tests as those suites are introduced. Each bug fix must add a regression test that reproduces the bug before the fix. Revisit affected-only CI execution when measured CI duration becomes a problem; it is not the current policy.

## Commits & Pull Requests

History uses imperative subjects, such as “Update README”; no enforced prefix exists. Explain changes, validation, and unresolved decisions in PRs. Link relevant issues.

Follow [ADR 0001](docs/adrs/0001-branching-and-ci-policy.md): branch from current `main`, keep branches short-lived, and submit focused PRs linked to approved plan items. Use descriptive names such as `feat/validate-inputs`, `fix/missing-input-error`, `docs/project-setup-design`, or `chore/configure-ci`. Squash-merge and delete merged branches.

The approved policy requires PRs, passing CI, resolved review conversations, linear history, and protection against force pushes and deletion of `main`. Require zero reviewer approvals while there is one maintainer; design and implementation-plan approvals still apply. Introduce required CI checks as their tooling becomes available. The active `Protect main` GitHub ruleset enforces these requirements. `.github/rulesets/main.json` records its configuration; `.github/workflows/ci.yml` supplies the required `CI` check.

## Automation Boundaries

Require human authorization before application submission. Never bypass access controls, CAPTCHAs, or anti-bot protections.

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax

<!-- nx configuration end-->
