# Feature 1: Project setup

Status: Branching and CI requirements approved; initial setup implementation explicitly authorized through GitHub CLI, with a TDD exception for this setup only.

## Intent and scope

Make WebRunbook ready for contributions from the maintainer, external contributors, and AI agents. Establish version-controlled development context, an approved planning workflow, and automated protection against regressions. This feature covers repository setup; browser-engine, storage, and other product architecture choices remain outside its scope.

## Development workflow

Brainstorm each feature, record its architectural decisions, and write a design based on those decisions. Obtain maintainer approval of the design and its ADRs, then brainstorm implementation separately.

Store `implementation-plan.md` beside the feature design. Break work into small, independently testable behaviors ordered by dependencies and risk. Each item states outcomes, acceptance scenarios, failure cases, dependencies, and references. Keep code, pseudocode, prescribed signatures, and class structures out of plans. Link relevant context so agents can work without loading an entire milestone.

Obtain approval of the complete plan once. Agents may then implement its items without per-item approval, using TDD for feature behavior and bug fixes: observe the expected failing test, implement enough to pass, and refactor while tests remain green. Changes to approved requirements, designs, or ADRs require discussion and approval before affected work continues.

## Branching and CI

[ADR 0001](../../../../adrs/0001-branching-and-ci-policy.md) defines the accepted policy: short-lived branches and focused PRs into protected `main`, squash merges, and zero required reviewer approvals for the sole maintainer.

CI checks formatting, linting, types, builds, and the full available regression suite as their tooling is introduced. Existing behavior remains covered by retained tests; bug fixes add reproductions. Browser regression tests exercise a local mock recruitment portal. Every PR receives a conclusive CI result, including documentation-only contributions.

## Approaches considered

GitHub Flow and full-suite PR testing were selected for simple integration and broad regression coverage. Git Flow adds unnecessary branch coordination at this stage. Affected-only execution remains a future option when measured CI duration warrants reconsideration. See ADR 0001 for the decision rationale.

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

## Validation and remaining decisions

During implementation, verify repository settings, successful and failing CI outcomes, and representative contribution paths, including forks and documentation-only changes. Confirm each introduced test suite participates in full regression execution.

Initial setup uses GitHub Actions with one required `CI` job, Node.js 24, the declared pnpm version, formatting checks, and full-workspace Nx targets. GitHub ruleset configuration is recorded in `.github/rulesets/main.json`; the workflow is `.github/workflows/ci.yml`.

No product test suites exist yet. The regression command runs all available `test`, `test-integration`, and `e2e` targets without cache replay. Future work must choose test frameworks, add the mock portal, and register every regression suite in CI. These additions remain subject to the normal design, planning, and TDD workflow.
