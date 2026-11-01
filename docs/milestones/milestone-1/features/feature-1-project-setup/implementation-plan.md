# Project setup implementation plan

Status: Approved — implementation and validation in progress.

## Outcome and scope

Implement the approved testing extension of [Feature 1: Project setup](design.md#unit-and-integration-testing), following [ADR 0003](../../../../adrs/0003-testing-and-coverage.md). Earlier documentation, branching, and linting setup is already implemented and is outside this plan.

Contributors can run focused Vitest suites through Nx. Required CI runs every package's unit and integration tests together once, publishes coverage, and blocks merging when tests fail, coverage is below the required floor, or coverage cannot be validated.

## Shared constraints

- Preserve Node.js 24, the declared pnpm version, strict TypeScript, ESLint, and Oxfmt.
- Unit tests sit beside source as `*.test.ts`; integration tests live in each package's `tests/integration/`. Their discovery must not overlap.
- Each production package independently requires at least 80% statements, branches, functions, and lines across both suites combined.
- Default tests use no credentials, paid APIs, or public-network access. Tests own and clean up their resources.
- Run real internal logic by default; justify internal mocks and assert observable behavior. Review each test's plausible failure and remove redundant assertions.
- Retain full CI regression execution without cache replay. Commit hooks run no tests, builds, separate compiler checks, or coverage collection.
- Browser tooling, a mock portal, mutation tooling, and shared UI build configuration are deferred.
- Use the repository's TDD workflow for introduced behavior. Record the intended failing result and subsequent passing result for each item. Validation fixtures must be clearly identified and must not masquerade as product functionality or inflate product coverage.

## Work items

### 1. Discover and run the intended suites

Dependencies: None. References: [Testing design](design.md#unit-and-integration-testing), [runner and organization](../../../../adrs/0003-testing-and-coverage.md#runner-and-organization).

- [ ] A fresh checkout can install the testing dependencies and run TypeScript tests using ESM through Nx on the supported runtime.
- [x] The local `test` target runs only unit tests; `test-integration` runs only integration tests, including nested integration directories. Helpers and fixtures are not discovered as tests.
- [x] A combined package run executes the union of both suites exactly once, reports failures from either suite, and exits after completion in CI and agent use.
- [x] Independent package runs do not discover another package's tests. Local contributor instructions explain focused and combined execution.
- [x] An empty workspace is reported honestly as having no product suites. A package containing production code cannot silently pass required validation because its testing setup or tests are missing.

Validation: Demonstrate discovery and failure propagation with isolated representative packages, including a package with only unit tests and one with both suites. No invented product package is required in the repository.

Status and evidence: Implemented; local validation passed. Separate unit and integration targets, combined discovery, nested integration tests, unit-only packages, absent tests, and independent temporary workspaces are covered by retained integration checks. Discovery failures were observed before implementation. Fresh-checkout Node.js 24 validation awaits GitHub CI.

### 2. Keep tests isolated and behavior-focused

Dependencies: Item 1. References: [Isolation and mocking](../../../../adrs/0003-testing-and-coverage.md#isolation-and-mocking), [test usefulness and review](../../../../adrs/0003-testing-and-coverage.md#test-usefulness-and-review).

- [x] Representative tests pass without credentials or public-network access, using controlled external boundaries and real internal collaborators.
- [x] Changes to mocks, environment, clocks, and temporary resources do not leak into subsequent tests. Cleanup also occurs when a test fails.
- [x] Tests pass independently and in different execution orders. Integration checks verify observable collaboration rather than merely confirming mock calls.
- [x] Contributor and agent guidance, plus the PR review guidance, require a stated behavior, plausible failure, meaningful assertions, and justification for internal mocks. Coverage percentages alone cannot satisfy this review.

Validation: Exercise resource cleanup and state isolation in deliberate success and failure cases. Review the added tests against the approved quality rules and retain only checks protecting distinct behavior.

Status and evidence: Complete. A deliberately failing fixture verifies cleanup of files, spies, environment, globals, and fake timers before the next test. All 39 tests pass both normally and with shuffled execution (seed 42). Tests exercise real files, Vitest, and Nx; the runner unit tests substitute only the external process boundary. Contributor, agent, and PR guidance record the quality policy.

### 3. Enforce combined coverage for each production package

Dependencies: Item 1. References: [Coverage and execution](../../../../adrs/0003-testing-and-coverage.md#coverage-and-execution), [testing acceptance criteria](design.md#acceptance-criteria).

- [x] Each package's combined run includes every in-scope production file, including unimported files. Tests, fixtures, generated code, and configuration do not inflate the denominator or numerator.
- [x] Each of statements, branches, functions, and lines accepts exactly 80% and rejects a value below 80%, independently of the other metrics.
- [x] Code reached by either suite counts toward combined coverage once. Suite percentages are not averaged, and high coverage in one package cannot offset another package's shortfall.
- [x] Missing, unreadable, malformed, or stale coverage cannot produce a successful gate. Collection and processing failures identify the affected package and block validation.
- [x] Exceptions remain explicit and documented; thresholds and production exclusions are not weakened automatically.

Validation: Use controlled coverage scenarios to demonstrate boundary values, complementary and overlapping suite coverage, newly untested source, unequal package coverage, and missing or invalid results. Preserve the failing cases as regressions for any custom enforcement behavior.

Status and evidence: Complete. Boundary tests first failed for each metric and then passed at exactly 80%; 79.99% is rejected. Real Vitest fixtures verify combined branch coverage and rejection of unimported source. Retained regressions reject stale, missing, malformed, inconsistent, and incomplete reports, low individual package coverage, and unusable downloadable artifacts. Local repository-tooling coverage: statements 84.82%, branches 86.30%, functions 87.50%, lines 86.87%. No product packages exist.

### 4. Make required CI enforce and explain the outcome

Dependencies: Items 1–3. References: [Coverage and execution](../../../../adrs/0003-testing-and-coverage.md#coverage-and-execution), [CI policy](../../../../adrs/0001-branching-and-ci-policy.md#decision).

- [ ] Every PR, including documentation-only changes, receives a conclusive required CI result. Each production package participates in the combined run; missing package coverage cannot be silently omitted.
- [x] CI runs each unit and integration test once, without replaying regression results from cache or additionally running the separate local suite targets. Existing lint, formatting, compiler, build, and other available regression checks remain covered.
- [x] Test failures, threshold violations, and coverage-processing failures make the required `CI` check fail. Publishing reports cannot overwrite or conceal that failure.
- [x] CI exposes package-level metric summaries and downloadable HTML and machine-readable reports. Valid reports remain available after threshold failures; unavailable reports are diagnosed clearly. No external coverage service is required.
- [x] Fresh-checkout instructions, agent guidance, and milestone status accurately describe the implemented behavior. Local hooks still run only their approved formatting and linting checks.

Validation: Verify passing and deliberately failing CI paths, report availability, package participation, and absence of duplicate suite execution. Record actual results without claiming product regression coverage while no product exists.

Status and evidence: Implemented; local CI-equivalent validation passed. All 39 tests run once in the combined repository suite, with no regression cache replay. Real child Nx runs verify unit and integration failures; runner regressions verify coverage/report failures cannot be hidden by publication. Test-only regression projects also participate. Formatting, lint, TypeScript, and diff checks pass. Actual GitHub execution and artifact download remain pending.

## Completion

All four items meet their acceptance scenarios, relevant repository checks pass, and validation evidence is recorded above. The complete plan requires approval once; execution does not require separate approval for each item. Material changes to approved requirements return to the maintainer for discussion.
