# Feature 1: Project setup

Status: Branching and CI setup implemented. Formatting and linting configured locally; CI validation of this extension is pending. The maintainer approved direct implementation of this initial setup without TDD or a separate implementation plan.

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

## Approaches considered

GitHub Flow and full-suite PR testing were selected for simple integration and broad regression coverage. Git Flow adds unnecessary branch coordination at this stage. Affected-only execution remains a future option when measured CI duration warrants reconsideration. See ADR 0001 for the decision rationale.

For linting, ESLint's recommended type-aware baseline with selected stricter rules was chosen over the full strict preset. Keep ESLint with Oxfmt for broad rule and integration coverage. Revisit Oxlint if measured CI linting time becomes a bottleneck, validating required rule coverage before any migration. Pre-commit formatting and linting cover humans and agents without relying on editor saves. Keeping tests out of the hook limits commit latency. See ADR 0002 for the alternatives and rationale.

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

## Validation and remaining decisions

During implementation, verify repository settings, successful and failing CI outcomes, and representative contribution paths, including forks and documentation-only changes. Confirm each introduced test suite participates in full regression execution.

Initial setup uses GitHub Actions with one required `CI` job, Node.js 24, the declared pnpm version, formatting checks, and full-workspace Nx targets. GitHub ruleset configuration is recorded in `.github/rulesets/main.json`; the workflow is `.github/workflows/ci.yml`.

No product test suites exist yet. The regression command runs all available `test`, `test-integration`, and `e2e` targets without cache replay. Future work must choose test frameworks, add the mock portal, and register every regression suite in CI. These additions remain subject to the normal design, planning, and TDD workflow.

For the linting extension, validate representative source, tests, and configuration, line-length boundaries, and staged versus unstaged changes. Confirm hook commands and CI enforcement without claiming any product regression coverage. Husky and lint-staged run sequential staged-file checks through Nx. Install hooks with `pnpm install`, or `pnpm run prepare` in an existing checkout. Root Nx targets expose formatting and linting; TypeScript files must belong to a project tsconfig for typed linting. The independent line-length checker also covers handwritten configuration formats that ESLint does not parse. Generated integration directories, dependencies, build outputs, and lockfiles are excluded explicitly.

Local setup validation on 2026-11-01 passed repository formatting and linting. Isolated fixtures verified every selected TypeScript rule, valid test source, 120/121-character boundaries for source, tests, JSON, and YAML, and documentation/generated/lockfile exclusions. Actual commits in a temporary repository verified staged formatting, preservation of unstaged changes, and rejection of lint and line-length violations with visible diagnostics. The hook did not invoke test, build, or typecheck targets. These checks validate tooling behavior, not product regression coverage; GitHub CI validation of this extension remains pending.
