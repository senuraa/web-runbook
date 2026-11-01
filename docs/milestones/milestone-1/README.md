# Milestone 1

## Outcome

Establish the repository foundations for open-source, AI-assisted development: discoverable decisions, approved designs and behavioral plans, TDD, and reliable contribution checks.

## Features

| Feature                                                                | Scope                                                                    | Status                                                                                                           |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| [Feature 1: Project setup](features/feature-1-project-setup/design.md) | Documentation workflow, branching policy, and CI with regression testing | Documentation, protections, linting, Vitest, and coverage gates implemented; CI validated; no product suites yet |

## Decisions

- [ADR 0001: Branching and CI policy](../../adrs/0001-branching-and-ci-policy.md)
- [ADR 0002: Formatting and TypeScript linting](../../adrs/0002-formatting-and-typescript-linting.md) — implemented; maintainer confirmed passing CI. Revisit Oxlint if measured CI linting time warrants it.
- [ADR 0003: Testing and coverage](../../adrs/0003-testing-and-coverage.md) — policy, testing design, and combined CI approach approved. The [behavioral implementation plan](features/feature-1-project-setup/implementation-plan.md) is complete; [GitHub CI](https://github.com/senuraa/web-runbook/actions/runs/41284952983) passed and downloaded coverage reports were verified.

- [ADR 0004: Merge commits for pull requests](../../adrs/0004-merge-commit-policy.md) — merge commits replace squash merges and the linear-history requirement; other protections remain unchanged.

Further setup decisions will be added as they are discussed. Acceptance of a policy does not mean its tooling or GitHub enforcement has been implemented.
