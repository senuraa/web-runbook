# Testing

## Running checks

Use Node.js 24 and the pnpm version declared in `package.json`. Run `pnpm install` in a fresh checkout. Tests use Vitest with a Node environment and explicit imports; compiler checks run separately.

Run tasks through Nx:

```sh
pnpm nx run repository:test
pnpm nx run repository:test-integration
pnpm nx run repository:test-all
pnpm nx run repository:typecheck
pnpm nx run repository:test-ci
```

Replace `repository` with a package's Nx name for its local suite targets. `repository:test-ci` always validates the whole workspace, running each eligible project's combined suite once and collecting fresh coverage for production sources. Normal commands exit after running; explicitly request watch mode for an interactive TDD session. Agents should use commands that exit.

There are currently no product packages. The repository suite exercises testing infrastructure, including deliberately invalid cases in temporary workspaces. Those cases are expected to fail inside the harness; the outer tests verify their failures. They are not product functionality or product coverage.

## Adding a package

Use the Nx generators and keep Nx plugin versions aligned. Once the package exists, configure its Node test environment:

```sh
pnpm nx g @nx/vitest:configuration --project=<name> --uiFramework=none --testEnvironment=node --coverageProvider=v8
```

Use the shared policy in the package's `vitest.config.mts` (for a package directly under `packages/`):

```ts
import { testingConfig } from '../../tools/testing/vitest.shared.config.mts';

export default testingConfig(import.meta.dirname);
```

The shared configuration discovers unit tests at `src/**/*.test.ts` and integration tests at `tests/integration/**/*.test.ts`. Keep fixtures near their consumers in `fixtures/` directories. Include both suite locations and the Vitest config in the package's test tsconfig so ESLint and the compiler check them.

The Nx Vitest plugin infers `test-all`, the combined target. Add the separate local targets to the package's `project.json`:

```json
{
  "targets": {
    "test": {
      "command": "pnpm exec vitest run --exclude 'tests/integration/**'",
      "options": { "cwd": "{projectRoot}" }
    },
    "test-integration": {
      "command": "pnpm exec vitest run tests/integration",
      "options": { "cwd": "{projectRoot}" }
    }
  }
}
```

An absent integration suite does not prevent the combined run from executing a package's unit tests. An explicitly requested empty suite fails with a no-tests diagnostic. A production package without tests, a combined target, or an Nx project cannot silently pass the coverage gate. The independent inventory check follows the current `packages/*` workspace layout; update it with behavioral checks when changing that layout.

## Writing useful tests

Follow TDD: observe the intended failing behavior, implement enough to pass, then refactor. Each test should protect an acceptance scenario, failure case, or regression and catch an identifiable plausible bug. Use meaningful assertions about outputs, errors, state, and required side effects.

Exercise real internal logic. Substitute external services and nondeterministic inputs; justify internal mocks. Verify collaborations with real components in integration tests. Do not duplicate lower-level assertions without protecting additional behavior. Interaction assertions are appropriate when the interaction is itself a requirement.

Default suites need no credentials, paid APIs, or public-network access. Use local services and temporary directories, register cleanup immediately, and ensure cleanup runs after failures. Shared setup restores spies, mocked state, environment variables, globals, and real timers. Test-owned files and servers still require explicit cleanup. Tests must pass independently and in different orders. Focused `.only` tests are rejected; failures are not automatically retried.

## Coverage and CI

Every production package requires at least 80% statements, branches, functions, and lines across its combined suites. Coverage includes unimported production files. Tests, fixtures, generated code, declaration files, and configuration are excluded; do not add production exclusions or lower thresholds merely to pass CI. Exceptions need a documented reason and maintainer approval.

CI runs the combined target once per project without regression cache replay. Projects containing only tests still run and can fail CI; their coverage is reported as N/A. Projects containing production sources run with coverage. It independently validates report counters and expected source-file membership. Previous reports are cleared first. Test failures, low coverage, missing or malformed reports, inconsistent totals, and missing or unreadable report artifacts block required CI. Machine-readable artifacts must also parse as JSON. A well-covered package cannot compensate for another package's shortfall.

GitHub Actions shows a coverage summary and retains a downloadable `coverage` artifact for 14 days, including HTML and JSON reports. Reports produced before a failure are still uploaded. Locally, inspect `coverage/summary.md`, `coverage/repository/index.html`, or `coverage/packages/<package>/index.html` after the CI-equivalent command.

Coverage is an execution measure, not proof of correct assertions. PR review must examine behavioral coverage and mocking choices even when the numeric gate passes. See [ADR 0003](adrs/0003-testing-and-coverage.md).

Pre-commit hooks run formatting and linting only. Browser tests, mutation tooling, and shared UI build/test configuration remain deferred.
