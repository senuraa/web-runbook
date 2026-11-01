# ADR 0003: Testing and coverage

- Status: Accepted
- Decision date: 2026-11-01
- Scope: Milestone 1, Feature 1 — Project setup
- Implementation: Complete; local checks and [GitHub CI](https://github.com/senuraa/web-runbook/actions/runs/41284952983) passed, including report publication

## Context

WebRunbook is a greenfield TypeScript project using Nx. Feature development follows TDD, and CI runs the full available regression suite. No product tests exist yet. AI-assisted development requires explicit standards for test usefulness, isolation, and mocking; coverage alone cannot establish correctness.

## Decision

### Runner and organization

Use Vitest for unit and integration tests, run through Nx. Its built-in TypeScript handling and ESM support suit the project. Retain separate compiler checks. When Vite is introduced for UI tooling, revisit shared build and test configuration.

- Unit tests live beside relevant source, for example `src/workflows/validate.test.ts`, under the `test` target.
- Integration tests live within each package at `tests/integration/*.test.ts`, including nested directories, under `test-integration`.
- Keep fixtures and helpers near their consumers. Test discovery must not overlap between the two targets.
- Defer browser-test setup until UI work. When introduced, browser tests use the local mock portal required by ADR 0001.

### Isolation and mocking

Exercise real internal logic by default. Substitute external boundaries and nondeterministic inputs, including AI providers, network access, clocks, and randomness. Internal mocking requires a concrete justification; never mock the behavior under test.

Integration tests exercise real collaborating components using temporary directories or local services as needed. Default suites require no credentials, paid APIs, or public-network access. Each test owns and cleans up its resources and must pass independently of execution order.

### Test usefulness and review

Every test protects an acceptance scenario, failure case, or regression. Reviewers must be able to identify a plausible bug it would catch. Assert observable results, errors, persisted state, or required side effects. Interaction assertions are appropriate when the interaction itself is a requirement, such as avoiding an AI request when reusing a workflow.

Follow the established TDD cycle: first observe failure for the intended missing behavior, not an import or fixture error. Remove tests that merely repeat existing assertions. Replace internal mocks with real collaborators when a test's purpose is integration. Lower-level unit coverage does not establish that components work together correctly.

PR reviews must assess test purpose and mocking choices. Mock counts and coverage percentages cannot replace this review. Targeted mutation testing remains a future option for critical logic, not a required tool in this setup.

### Coverage and execution

Require at least **80% statements, branches, functions, and lines for each package containing production code**. Evaluate each metric independently against combined unit-and-integration coverage, counting overlapping execution once. Do not average percentages across suites or allow one package to compensate for another.

CI runs unit and integration suites together once per package and produces their combined coverage directly. Keep separate local `test` and `test-integration` targets. CI must not also rerun those local targets for the same suites. Separate CI suite runs followed by coverage merging are deferred unless future execution needs justify the additional complexity.

Include production files that no test imports. Exclude tests, fixtures, generated code, and configuration; do not exclude production code because it is difficult to test. Critical behavior and failure cases require explicit tests regardless of the percentage. Exceptions require a documented reason and maintainer approval; agents must not weaken thresholds or add exclusions just to pass CI.

Provide a CI coverage summary, downloadable HTML reports, and machine-readable results. A failing test or coverage gate fails required CI. Coverage collection and report-processing failures must also fail CI rather than silently skip enforcement. Full regression execution remains mandatory; no tests or coverage collection run in commit hooks.

## Alternatives considered

- **Jest:** Supported by Nx, but this repository has no existing Jest investment to preserve; Vitest was selected for TypeScript and ESM support.
- **Node's built-in runner:** Fewer dependencies, but requires more assembly of the desired tooling and conventions.
- **Report-only coverage:** Rejected; the maintainer requires an enforced 80% floor.
- **Separate CI suite runs and merged coverage:** Deferred; a combined run per package avoids report-merging complexity and duplicate test execution.
- **Mocking every dependency:** Risks testing implementation details and mock behavior instead of the required outcome.

## Consequences

Coverage collection adds CI work, and meaningful integration tests require controlled resources. The percentage floor complements behavioral review and TDD; it does not prove test quality. Empty scaffolding is not evidence of product coverage. Exact configuration, coverage aggregation, and tooling versions remain implementation choices within this policy.

## References

- [Project setup design](../milestones/milestone-1/features/feature-1-project-setup/design.md)
- [ADR 0001: Branching and CI](0001-branching-and-ci-policy.md)
- [Nx and Vitest](https://nx.dev/docs/technologies/test-tools/vitest/introduction)
- [Vitest coverage configuration](https://vitest.dev/config/coverage)
- [Reviewing AI-generated tests](https://vitest.dev/guide/learn/writing-tests-with-ai)
