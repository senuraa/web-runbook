# ADR 0002: Formatting and TypeScript linting

- Status: Accepted
- Decision date: 2026-11-01
- Scope: Milestone 1, Feature 1 — Project setup
- Implementation: Configured; initial setup approved for direct implementation without TDD or a separate plan

## Context

Humans and AI agents contribute to the same repository. The maintainer uses JetBrains, while agents may write files without triggering editor save actions. Before this change, the repository used Oxfmt with single quotes and strict TypeScript compiler settings, but had no linter or commit hooks configured. Contributors need consistent checks without running tests on every local commit.

## Decision

### Formatting and line length

- Use two spaces per indentation level, with spaces rather than indentation tabs.
- Keep Oxfmt and the existing single-quote preference, with a wrapping target of 120 characters.
- Enforce a hard maximum of 120 characters per line, including indentation, in handwritten source, tests, and configuration files.
- Exempt documentation from the hard limit. Exclude generated files, dependencies, build output, and lockfiles from handwritten-file checks.
- Cover configuration formats such as JavaScript, TypeScript, JSON, JSONC, and YAML; enforcement must not be limited to TypeScript.

Oxfmt handles automatic wrapping. An independent check must reject remaining overlong lines, including comments and string literals. Do not silently exempt long URLs or strings. If a configuration value cannot fit without changing its meaning, raise the conflict for a decision.

### TypeScript linting

Use ESLint with the recommended type-aware typescript-eslint baseline and selected stricter rules:

- Reject explicit `any` and unsafe operations on values typed as `any`; use `unknown` and narrowing where needed.
- Reject unhandled promises and promises used where synchronous values are expected.
- Reject unused variables and imports.
- Require exhaustive handling of discriminated unions in switches.
- Require consistent type-only imports.
- Reject unnecessary type assertions.
- Prefer `const` when reassignment is unnecessary.

Retain existing strict compiler checks. Oxfmt owns layout; avoid overlapping formatting rules in ESLint, apart from the hard line-length requirement. Apply typed linting to TypeScript files belonging to configured projects; other configuration formats receive appropriate checks.

Keep ESLint and Oxfmt for their broader rule and integration coverage. Revisit Oxlint if measured CI linting duration becomes a bottleneck. Before migrating, benchmark representative projects and verify coverage of the selected TypeScript rules, Nx module boundaries, and any manifest dependency checks. This is a future option, not an approved migration; retain the current TypeScript version.

### Commit hooks and CI

Before a local commit, format staged files, then lint them and enforce line length. Include successful formatting changes in the commit while preserving unrelated and unstaged work. Block the commit when violations remain.

Do not run tests, builds, or a separate type-check command in pre-commit. Type-aware linting may use TypeScript information internally. TDD test execution remains part of development, independent of committing.

CI independently verifies formatting and linting, and retains type checking, builds, and the full available regression suite on every PR. Agents must resolve hook failures rather than bypass them. Editor format-on-save is optional convenience; local hooks do not replace required CI.

## Alternatives considered

- **Editor-only formatting:** Does not cover agents or contributors using different editors.
- **Formatter width alone:** Cannot guarantee a hard maximum.
- **Full strict type-aware preset:** Adds broader opinionated restrictions; selected stricter rules keep the policy explicit.
- **Tests in pre-commit:** Adds unwanted latency; retain tests in development and CI.
- **Oxlint:** A potential performance improvement, deferred in favor of ESLint's broader coverage. Reconsider based on measured CI linting time and rule compatibility.

## Consequences and implementation

Some long lines require manual restructuring. Typed linting adds work to the hook, but tests and builds do not. Existing handwritten files must comply when enforcement is introduced, and exclusions must remain explicit.

Husky installs the pre-commit hook through `pnpm install` (or `pnpm run prepare` for an existing checkout). lint-staged runs formatting, ESLint, and the independent line-length checker sequentially. Nx exposes repository-wide `format`, `format-check`, and `lint` targets, plus the staged `pre-commit` target. File patterns and exclusions are version-controlled in the formatter, linter, and `tools/lint-policy.mjs` configuration. JSON and YAML receive formatting and line-length checks; semantic lint rules currently cover JavaScript and TypeScript.

## References

- [Project setup design](../milestones/milestone-1/features/feature-1-project-setup/design.md)
- [Oxfmt configuration](https://oxc.rs/docs/guide/usage/formatter/config-file-reference)
- [TypeScript ESLint configurations](https://typescript-eslint.io/users/configs/)
- [Line-length enforcement](https://eslint.style/rules/max-len)
