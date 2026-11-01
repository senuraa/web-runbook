# Milestone 1

## Outcome

Establish the repository foundations for open-source, AI-assisted development: discoverable decisions, approved designs and behavioral plans, TDD, and reliable contribution checks.

## Features

| Feature                                                                | Scope                                                                    | Status                                                                                                 |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| [Feature 1: Project setup](features/feature-1-project-setup/design.md) | Documentation workflow, branching policy, and CI with regression testing | Policy approved; initial GitHub protections applied and CI workflow added; product test suites pending |

## Decisions

- [ADR 0001: Branching and CI policy](../../adrs/0001-branching-and-ci-policy.md)
- [ADR 0002: Formatting and TypeScript linting](../../adrs/0002-formatting-and-typescript-linting.md) — ESLint, Oxfmt, and staged-file hooks configured locally; CI validation pending. Revisit Oxlint if measured CI linting time warrants it.

Further setup decisions will be added as they are discussed. Acceptance of a policy does not mean its tooling or GitHub enforcement has been implemented.
