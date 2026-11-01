# ADR 0004: Merge commits for pull requests

- Status: Accepted
- Decision date: 2026-11-01
- Scope: Milestone 1, Feature 1 — Project setup
- Supersedes: The squash-merge and linear-history requirements in [ADR 0001](0001-branching-and-ci-policy.md)

## Context

ADR 0001 initially selected squash merges and linear history. The maintainer now requires PRs to preserve their individual commits and be integrated using a merge commit. GitHub's linear-history requirement prohibits merge commits, so that requirement must change with the merge method.

## Decision

Use merge commits for all PRs. Enable GitHub's merge-commit option and disable squash and rebase merging. Restrict the `Protect main` ruleset to the `merge` method and remove its linear-history rule.

Keep short-lived branches, required PRs, passing CI against up-to-date code, resolved review conversations, zero required reviewer approvals for the sole maintainer, and no bypass actors. Continue blocking force pushes and deletion of `main`, and automatically delete merged branches. Design and implementation-plan approvals remain required.

## Alternatives considered

- **Squash merging:** Produces one commit per PR but does not retain its individual commits on `main`.
- **Rebase merging:** Produces linear history but does not retain an explicit merge commit for the PR.
- **Allowing multiple merge methods:** Would permit merges that do not follow the maintainer's selected policy.

## Consequences

History retains the commits from each PR and an explicit merge commit. The commit graph will contain branches and merges. Contributors should keep commits understandable; CI and review requirements still apply before merging.

The ruleset is recorded in [main.json](../../.github/rulesets/main.json). Repository settings control the enabled merge methods and automatic branch deletion. Existing merged history is not rewritten.

## References

- [Project setup design](../milestones/milestone-1/features/feature-1-project-setup/design.md)
- [GitHub rules: required linear history](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets#require-linear-history)
