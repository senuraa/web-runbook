# ADR 0001: Branching and CI policy

- Status: Accepted
- Decision date: 2026-11-01
- Scope: Milestone 1, Feature 1 — Project setup
- Enforcement: Active GitHub ruleset; CI workflow supplied by the initial setup change

## Context

WebRunbook is an open-source project developed with AI assistance and initially has one maintainer. Contributions need a clear review trail and protection against regressions. At decision time, the repository had no executable projects or general CI workflow. Designs and behavioral implementation plans require maintainer approval before implementation.

## Decision

Use GitHub Flow with `main` as the integration branch. Create short-lived branches from current `main` for independently testable work items or cohesive documentation changes. External contributors can submit PRs from forks. Link implementation PRs to their approved plan items and include validation results.

Use descriptive branch names, such as `feat/validate-inputs`, `fix/missing-input-error`, `docs/project-setup-design`, and `chore/configure-ci`. Squash-merge completed PRs and delete merged branches. Track milestones in documentation and issues rather than long-lived milestone branches.

Protect `main` with an active branch ruleset requiring:

- A pull request before merging.
- Passing required CI checks, introduced as the corresponding tooling becomes available.
- Resolution of review conversations.
- Linear history, with squash merging selected as the repository merge method.
- Blocking force pushes and deletion of `main`.
- Zero required reviewer approvals while the project has one maintainer.

The absence of a PR approval gate does not remove maintainer approval of designs and implementation plans. A complete implementation plan is approved once; its individual work items do not require separate approval.

CI will check formatting, linting, type checking, builds, and tests as their tooling is introduced. Every PR will run the full available regression suite, including unit, integration, and browser scenarios. Documentation-only PRs must receive a conclusive CI result rather than leave required checks pending.

Retain TDD tests as regression coverage. Each bug fix must first add a test reproducing the bug. Browser tests must use the local mock recruitment portal. Passing CI verifies the resulting behavior; it does not prove the test-first development sequence was followed.

Reconsider affected-only execution when measured CI duration becomes a problem. No duration threshold or alternative schedule has been selected.

## Alternatives considered

- **Git Flow:** A separate `develop` branch and release branches add coordination without a current release-management need.
- **Mandatory reviewer approval:** A sole maintainer cannot approve their own PR; a required approval would obstruct routine contributions.
- **Affected-only PR testing with periodic full runs:** May reduce CI time later, but full-suite execution is the initial policy for broad regression coverage.

## Consequences

Contributions have small, traceable changes and consistent automated checks. Full-suite runtime will grow with the project and should be observed before changing this policy. The single maintainer remains responsible for merge decisions. Passing checks are not an independent human review.

The maintainer subsequently authorized initial setup directly through GitHub CLI, explicitly exempting this setup from TDD. GitHub Actions provides the required `CI` check using Node.js 26 LTS and the pnpm version declared in `package.json`. The maintainer selected Node.js 26 LTS on 2026-11-01, replacing the initial Node.js 24 runtime. The workflow checks formatting and runs all available Nx `lint`, `typecheck`, and `build` targets.

[ADR 0003](0003-testing-and-coverage.md) extends this policy with the implemented Vitest setup and per-package coverage gates. CI invokes `repository:test-ci` to run each eligible project's combined `test-all` target once, collecting coverage for production sources. Separate local `test` and `test-integration` targets remain available but are not rerun in CI. Available `e2e` targets run separately. Regression execution does not replay cached results.

Repository tooling tests are implemented; no product test suites exist yet. Browser tooling and the mock recruitment portal remain deferred until UI work. Record material changes to this policy in a superseding ADR.

The active [Protect main ruleset](https://github.com/senuraa/web-runbook/rules) has no bypass actors and requires checks from GitHub Actions against up-to-date code. Its configuration is stored in `.github/rulesets/main.json`. Squash-only merging and automatic branch deletion are repository settings.

## References

- [Project setup design](../milestones/milestone-1/features/feature-1-project-setup/design.md)
- [ADR 0003: Testing and coverage](0003-testing-and-coverage.md)
- [GitHub Flow](https://docs.github.com/en/get-started/using-github/github-flow)
- [Available ruleset rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets)
- [GitHub pull request reviews](https://docs.github.com/en/pull-requests/how-tos/review-pull-requests/reviewing-proposed-changes-in-a-pull-request)
