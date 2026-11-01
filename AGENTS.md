# Repository Guidelines

## Project Structure & Direction

WebRunbook is in discovery. Read `README.md` and `docs/project-brief.md`; distinguish proposals from implementation. `packages/` is empty; no source, tests, or assets exist. `nx.json` and `tsconfig.base.json` configure the workspace.

## Development Commands

Use `pnpm@12.16.1`:

- `pnpm install`: install dependencies.
- `pnpm nx show projects`: discover projects (currently none).
- `pnpm nx run <project>:<target>`: run an existing target.

No build, test, or development targets exist.

## Coding Style & Naming

Use strict TypeScript, two-space indentation, and descriptive names. Oxfmt configures single quotes; check files with `pnpm exec oxfmt --check <files>`. No linter is configured.

## Testing Guidelines

No framework, naming convention, or coverage threshold exists. Document these when adding tests. Use a local mock recruitment portal for browser testing.

## Commits & Pull Requests

History uses imperative subjects, such as “Update README”; no enforced prefix exists. Explain changes, validation, and unresolved decisions in PRs. Link relevant issues.

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
