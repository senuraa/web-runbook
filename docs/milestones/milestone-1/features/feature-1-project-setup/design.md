# Feature 1: Project setup

Status: Branching, formatting, linting, and CI setup implemented; the maintainer confirmed passing CI. The maintainer approved direct implementation of those initial changes without TDD or a separate implementation plan. Testing policy, design, and the combined CI approach are approved. The [behavioral implementation plan](implementation-plan.md) is approved and in progress.

## Intent and scope

Make WebRunbook ready for contributions from the maintainer, external contributors, and AI agents. Establish version-controlled development context, an approved planning workflow, and automated protection against regressions. This feature covers repository setup; browser-engine, storage, and other product architecture choices remain outside its scope.

## Development workflow

Brainstorm each feature, record its architectural decisions, and write a design based on those decisions. Obtain maintainer approval of the design and its ADRs, then brainstorm implementation separately.

Store `implementation-plan.md` beside the feature design. Break work into small, independently testable behaviors ordered by dependencies and risk. Each item states outcomes, acceptance scenarios, failure cases, dependencies, and references. Keep code, pseudocode, prescribed signatures, and class structures out of plans. Link relevant context so agents can work without loading an entire milestone.

Obtain approval of the complete plan once. Agents may then implement its items without per-item approval, using TDD for feature behavior and bug fixes: observe the expected failing test, implement enough to pass, and refactor while tests remain green. Changes to approved requirements, designs, or ADRs require discussion and approval before affected work continues.

## Branching and CI

[ADR 0001](../../../../adrs/0001-branching-and-ci-policy.md) defines the accepted policy: short-lived branches and focused PRs into protected `main`, squash merges, and zero required reviewer approvals for the sole maintainer.

CI checks formatting, linting, types, builds, and the full available regression suite as their tooling is introduced. Existing behavior remains covered by retained tests; bug fixes add reproductions. Browser regression tests exercise a local mock recruitment portal. Every PR receives a conclusive CI result, including documentation-only contributions.

## Formatting, linting, and local commits

[ADR 0002](../../../../adrs/0002-formatting-and-typescript-linting.md) defines the accepted policy. Handwritten source, tests, and configuration use two-space indentation and a hard maximum of 120 characters per line. Documentation is exempt from the hard limit; generated files and lockfiles are excluded from handwritten-file checks.

Oxfmt formats files and preserves the existing single-quote preference. A separate check enforces the hard maximum across source and configuration formats, including comments and strings. TypeScript linting uses the recommended type-aware baseline with the explicit correctness rules in ADR 0002. Formatter and linter share configuration across local commands, hooks, and CI.

At commit time, the hook formats staged files before linting them. Successful formatting changes are included in the commit. Remaining lint or line-length violations block the commit with actionable file and line diagnostics. Partially staged files and unrelated unstaged changes must be preserved; the hook must not accidentally commit additional work.

The hook runs no tests, builds, or separate compiler check. CI remains responsible for those checks on every PR, alongside formatting and linting verification. TDD still requires running behavioral tests during development. JetBrains format-on-save is optional; agent commits receive the same hook checks when hooks are installed. Hook installation must be documented and reproducible for a fresh checkout.

## Unit and integration testing

[ADR 0003](../../../../adrs/0003-testing-and-coverage.md) defines the accepted testing policy. Vitest supplies unit and integration execution through Nx. Colocate unit `*.test.ts` files with source and place integration tests under each package's `tests/integration/`; the `test` and `test-integration` targets select disjoint suites. Fixtures and helpers stay near their consumers. Browser-test setup is deferred until UI work. Revisit shared build and test configuration when Vite is introduced for UI tooling.

Unit tests exercise real internal logic. Substitute external boundaries and nondeterministic inputs; internal mocks need justification. Integration tests exercise real collaborators with temporary directories or local services. Tests require no credentials, paid APIs, or public-network access, clean up their resources, and run independently of order.

Each test maps to required behavior and an identifiable plausible failure. Follow TDD and review test purpose, meaningful assertions, and mock choices in PRs. Remove redundant tests and replace internal mocks with real collaborators when verifying integration. Required interactions may be asserted directly; incidental implementation call sequences should not define correctness.

Coverage combines unit and integration execution per package without double-counting or averaging suite percentages. CI rejects any production package below 80% in statements, branches, functions, or lines, even if its tests pass. Untested production files remain in the denominator. Only explicit non-production exclusions apply; exceptions require a documented reason and maintainer approval. Critical behaviors and failure cases require tests regardless of aggregate coverage.

The approved execution approach is one combined unit-and-integration run per package in CI, producing combined coverage directly. Preserve separate local suite targets for focused development. CI must not additionally invoke those targets for the same suites. Separate CI runs followed by report merging remain a future option if distribution needs justify them.

CI provides a readable summary and downloadable HTML and machine-readable reports. Coverage collection or report-processing failures fail CI rather than bypass enforcement. Preserve full regression execution and separate compiler checks. Commit hooks remain free of tests and coverage collection. Empty packages must not be presented as having validated production coverage.

## Approaches considered

GitHub Flow and full-suite PR testing were selected for simple integration and broad regression coverage. Git Flow adds unnecessary branch coordination at this stage. Affected-only execution remains a future option when measured CI duration warrants reconsideration. See ADR 0001 for the decision rationale.

For linting, ESLint's recommended type-aware baseline with selected stricter rules was chosen over the full strict preset. Keep ESLint with Oxfmt for broad rule and integration coverage. Revisit Oxlint if measured CI linting time becomes a bottleneck, validating required rule coverage before any migration. Pre-commit formatting and linting cover humans and agents without relying on editor saves. Keeping tests out of the hook limits commit latency. See ADR 0002 for the alternatives and rationale.

Vitest was chosen over Jest and Node's built-in runner for its TypeScript and ESM support in a greenfield repository and future alignment with Vite. Coverage reporting without a gate was rejected in favor of an enforced 80% floor. Behavioral review addresses weaknesses that coverage cannot detect. See ADR 0003 for the alternatives and consequences.

## Acceptance criteria

- Contributors can find the milestone, feature design, implementation plan when approved, and relevant ADRs through repository links.
- Approved plan items describe observable requirements and can be implemented without separate approval for each item.
- Changes to `main` require a PR and successful required checks; force pushes and deletion are blocked.
- A sole maintainer can merge a compliant PR without another reviewer's approval.
- Merges preserve linear history, and merged branches are removed.
- Unresolved review conversations prevent merging.
- A failing regression test prevents a PR from satisfying CI requirements.
- Every PR runs the full available regression suite; documentation-only changes do not leave required checks waiting indefinitely.
- Browser tests use the mock portal rather than submitting real job applications.

Additional formatting and linting acceptance criteria:

- Source, tests, and handwritten configuration are formatted with two-space indentation.
- A 120-character line is accepted; a 121-character line in an in-scope file is rejected, even after formatting.
- Overlong documentation lines do not fail the hard-limit check; generated files and lockfiles are excluded.
- Each selected TypeScript rule rejects its violating behavior and accepts a valid alternative.
- A commit formats and lints staged content, preserves unstaged work, and fails if violations remain.
- The hook invokes no test runner, build, or separate type-check command.
- Fresh-checkout contributors can install the same hooks used by agents and JetBrains commits.
- CI rejects formatting, lint, and line-length violations independently of whether local hooks ran.

Additional testing acceptance criteria:

- Unit and integration tests can run independently through Nx, with no duplicate test discovery.
- Default tests run without credentials or public-network access and clean up their resources on success and failure.
- A required behavior's test fails for the intended reason before implementation and passes after it.
- A failing test fails required CI; passing tests cannot override a failing coverage gate.
- Coverage collection or report-processing failures fail required CI rather than silently skipping the gate.
- Each coverage metric accepts 80% and rejects values below 80% for each production package.
- Combined coverage counts code exercised by either suite once; a well-covered package cannot hide another package's shortfall.
- CI executes each unit and integration test once per package while local suite targets remain independently runnable.
- Adding untested production code lowers reported coverage; excluded non-production files do not affect the denominator.
- CI exposes coverage summaries and inspectable reports without an external coverage service.
- Test review identifies the behavior, plausible failure, and justification for internal mocks; percentage compliance alone is insufficient.
- Testing setup does not add tests or coverage to commit hooks or introduce browser tooling.

## Validation and remaining decisions

During implementation, verify repository settings, successful and failing CI outcomes, and representative contribution paths, including forks and documentation-only changes. Confirm each introduced test suite participates in full regression execution.

Initial setup uses GitHub Actions with one required `CI` job, Node.js 24, the declared pnpm version, formatting checks, and full-workspace Nx targets. GitHub ruleset configuration is recorded in `.github/rulesets/main.json`; the workflow is `.github/workflows/ci.yml`.

No product test suites exist yet. The regression flow uses `repository:test-ci` for combined unit/integration execution and coverage, and runs other `e2e` targets separately without cache replay. Vitest is configured for the repository tooling tests. The combined coverage command validates project participation and source-file membership, runs each eligible suite once, and publishes reports. GitHub CI validation of this extension is pending. The mock portal and browser tooling remain deferred. These additions remain subject to the normal design, planning, and TDD workflow.

For the linting extension, validate representative source, tests, and configuration, line-length boundaries, and staged versus unstaged changes. Confirm hook commands and CI enforcement without claiming any product regression coverage. Husky and lint-staged run sequential staged-file checks through Nx. Install hooks with `pnpm install`, or `pnpm run prepare` in an existing checkout. Root Nx targets expose formatting and linting; TypeScript files must belong to a project tsconfig for typed linting. The independent line-length checker also covers handwritten configuration formats that ESLint does not parse. Generated integration directories, dependencies, build outputs, and lockfiles are excluded explicitly.

Local setup validation on 2026-11-01 passed repository formatting and linting. Isolated fixtures verified every selected TypeScript rule, valid test source, 120/121-character boundaries for source, tests, JSON, and YAML, and documentation/generated/lockfile exclusions. Actual commits in a temporary repository verified staged formatting, preservation of unstaged changes, and rejection of lint and line-length violations with visible diagnostics. The hook did not invoke test, build, or typecheck targets. The maintainer subsequently confirmed passing GitHub CI for that setup. These checks validate tooling behavior, not product regression coverage.
