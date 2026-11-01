## Change

Describe the behavior changed and link the approved plan item or issue.

## Validation

- State the checks run and their results, including the intended failing test before implementation where TDD applies.
- Identify the acceptance scenarios, failure cases, or regressions protected by added tests.
- Explain any internal mocks and why real collaborators are unsuitable. Remove tests that only repeat other assertions.
- Review coverage gaps in changed production code. Passing the 80% gate does not replace meaningful behavioral coverage.
- Document any maintainer-approved coverage exception; do not weaken thresholds or exclusions just to pass CI.

## Remaining work

List unresolved decisions or limitations, or state none.
