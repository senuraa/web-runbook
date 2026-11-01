import { existsSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from 'vitest';
import { executeNx } from '../../tools/testing/coverage-runner.mts';
import { fixture } from './helpers/workspace';
import { checkCoverage } from '../../tools/testing/coverage-policy.mts';

function twoSuites() {
  const workspace = fixture();
  workspace.write('src/choose.ts', 'export function choose(flag: boolean) { return flag ? "yes" : "no"; }\n');
  workspace.write(
    'src/choose.test.ts',
    `import { expect, test } from 'vitest';
import { choose } from './choose';
test('chooses no', () => expect(choose(false)).toBe('no'));\n`,
  );
  workspace.write(
    'tests/integration/nested/choose.test.ts',
    `import { expect, test } from 'vitest';
import { choose } from '../../../src/choose';
test('chooses yes', () => expect(choose(true)).toBe('yes'));\n`,
  );
  return workspace;
}

test('runs each suite separately and both together exactly once', () => {
  const workspace = twoSuites();
  workspace.write('src/fixtures/unwanted.test.ts', 'throw new Error("fixture discovered");');
  workspace.write('other/src/unwanted.test.ts', 'throw new Error("another package discovered");');
  const combined = workspace.run();
  expect(combined.status, combined.output).toBe(0);
  expect(combined.results.numTotalTests).toBe(2);
  const unit = workspace.run('--exclude', 'tests/integration/**');
  expect(unit.status, unit.output).toBe(0);
  expect(unit.results.numTotalTests).toBe(1);
  const integration = workspace.run('tests/integration');
  expect(integration.status, integration.output).toBe(0);
  expect(integration.results.numTotalTests).toBe(1);
});

test('combines complementary branches and publishes reports before rejecting untested source', () => {
  const workspace = twoSuites();
  const first = workspace.run('--coverage');
  expect(first.status, first.output).toBe(0);
  const directory = join(workspace.root, 'coverage');
  expect(checkCoverage(directory, [join(workspace.root, 'src/choose.ts')]).branches).toBe(100);
  expect(existsSync(join(directory, 'index.html'))).toBe(true);
  workspace.write('src/unimported.ts', 'export function neverCalled() { return 42; }\n');
  const second = workspace.run('--coverage');
  expect(second.status).not.toBe(0);
  const report = readFileSync(join(directory, 'coverage-summary.json'), 'utf8');
  expect(report).toContain('unimported.ts');
  expect(existsSync(join(directory, 'index.html'))).toBe(true);
});

test('a failed test still cleans resources and restores clocks, environment, globals and spies', () => {
  const workspace = fixture();
  workspace.write(
    'src/cleanup.test.ts',
    `import { expect, test, vi, onTestFinished } from 'vitest';
import { rmSync, writeFileSync, existsSync } from 'node:fs';
test('fails deliberately after acquiring resources', () => {
  writeFileSync('temporary-resource', 'temporary');
  onTestFinished(() => rmSync('temporary-resource'));
  vi.stubEnv('TEST_POLICY_VALUE', 'changed');
  vi.stubGlobal('testPolicyValue', 'changed');
  vi.spyOn(console, 'info').mockImplementation(() => {});
  vi.useFakeTimers();
  throw new Error('deliberate failure');
});
test('receives a clean environment after the failure', () => {
  expect(existsSync('temporary-resource')).toBe(false);
  expect(process.env.TEST_POLICY_VALUE).toBeUndefined();
  expect('testPolicyValue' in globalThis).toBe(false);
  expect(vi.isMockFunction(console.info)).toBe(false);
  expect(vi.isFakeTimers()).toBe(false);
});\n`,
  );
  const result = workspace.run();
  expect(result.status).not.toBe(0);
  expect(result.results.numFailedTests).toBe(1);
  expect(result.results.numPassedTests).toBe(1);
  expect(existsSync(join(workspace.root, 'temporary-resource'))).toBe(false);
});

test('the CI executor runs real Nx coverage and propagates failures from either suite', () => {
  const workspace = twoSuites();
  workspace.write('nx.json', '{}');
  workspace.write(
    'project.json',
    JSON.stringify({
      name: 'fixture',
      targets: { 'test-all': { command: 'vitest run', cache: false } },
    }),
  );
  const directory = join(workspace.root, 'ci-coverage');
  const project = { name: 'fixture', root: '.' };
  expect(executeNx(workspace.root, project, directory)).toBe(0);
  expect(existsSync(join(directory, 'coverage-summary.json'))).toBe(true);
  workspace.write(
    'tests/integration/nested/failure.test.ts',
    `import { test } from 'vitest';
test('deliberate integration failure', () => { throw new Error('integration failure'); });\n`,
  );
  expect(executeNx(workspace.root, project, directory)).toBe(1);
  rmSync(join(workspace.root, 'tests/integration/nested/failure.test.ts'));
  workspace.write(
    'src/choose.test.ts',
    `import { test } from 'vitest';
test('deliberate unit failure', () => { throw new Error('unit failure'); });\n`,
  );
  expect(executeNx(workspace.root, project, directory)).toBe(1);
}, 30000);

test('a unit-only package succeeds, while production without tests fails', () => {
  const workspace = fixture();
  workspace.write('src/value.ts', 'export const value = 42;\n');
  const missing = workspace.run('--coverage');
  expect(missing.status).not.toBe(0);
  workspace.write(
    'src/value.test.ts',
    `import { expect, test } from 'vitest';
import { value } from './value';
test('returns the value', () => expect(value).toBe(42));\n`,
  );
  const present = workspace.run('--coverage');
  expect(present.status, present.output).toBe(0);
  expect(present.results.numTotalTests).toBe(1);
});

test('the CI executor runs test-only regression suites without collecting invented coverage', () => {
  const workspace = fixture();
  workspace.write('nx.json', '{}');
  workspace.write(
    'project.json',
    JSON.stringify({ name: 'fixture', targets: { 'test-all': { command: 'vitest run', cache: false } } }),
  );
  workspace.write(
    'tests/integration/retained.test.ts',
    `import { expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
test('runs in the package workspace', () => {
  expect(JSON.parse(readFileSync('package.json', 'utf8')).name).toBe('policy-fixture');
});\n`,
  );
  const directory = join(workspace.root, 'ci-coverage');
  expect(executeNx(workspace.root, { name: 'fixture', root: '.' }, directory, false)).toBe(0);
  expect(existsSync(directory)).toBe(false);
});
