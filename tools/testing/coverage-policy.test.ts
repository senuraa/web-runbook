import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, expect, test } from 'vitest';
import { checkCoverage, coverageProjects } from './coverage-policy.mts';

const directories: string[] = [];
function workspace() {
  const root = mkdtempSync(join(tmpdir(), 'coverage-policy-'));
  directories.push(root);
  return root;
}
function source(root: string, file: string) {
  mkdirSync(join(root, file, '..'), { recursive: true });
  writeFileSync(join(root, file), 'export const value = 1;\n');
}
afterEach(() => directories.splice(0).forEach((root) => rmSync(root, { recursive: true, force: true })));

test('includes production packages even when no tests import their source', () => {
  const root = workspace();
  source(root, 'packages/a/src/unimported.ts');
  const project = { name: 'a', root: 'packages/a', targets: { 'test-all': {} } };
  expect(coverageProjects(root, [project])).toEqual([project]);
});

test('rejects a production package missing the combined test target', () => {
  const root = workspace();
  source(root, 'packages/a/src/index.ts');
  expect(() => coverageProjects(root, [{ name: 'a', root: 'packages/a' }])).toThrow(/a.*test-all/);
});

test('rejects production code in a package absent from the Nx graph', () => {
  const root = workspace();
  source(root, 'packages/forgotten/src/index.ts');
  expect(() => coverageProjects(root, [])).toThrow(/forgotten/);
});

test('does not report empty scaffolding and non-production files as product coverage', () => {
  const root = workspace();
  source(root, 'packages/empty/src/types.d.ts');
  source(root, 'packages/empty/src/fixtures/value.test.ts');
  source(root, 'packages/empty/tests/fixtures/sample.ts');
  source(root, 'packages/empty/vitest.config.mts');
  source(root, 'packages/empty/src/generated/client.ts');
  expect(coverageProjects(root, [{ name: 'empty', root: 'packages/empty' }])).toEqual([]);
});

const metrics = ['statements', 'branches', 'functions', 'lines'];
function report(root: string, changed = '', covered = 5, total = 5) {
  const summary = Object.fromEntries(
    metrics.map((metric) => [
      metric,
      { total: metric === changed ? total : 5, covered: metric === changed ? covered : 5, skipped: 0, pct: 100 },
    ]),
  );
  const file = join(root, 'source.ts');
  writeFileSync(join(root, 'coverage-summary.json'), JSON.stringify({ total: summary, [file]: summary }));
  return file;
}

test.each(metrics)('accepts exactly 80 percent %s coverage', (metric) => {
  const root = workspace();
  const file = report(root, metric, 4, 5);
  expect(checkCoverage(root, [file])[metric]).toBe(80);
});

test.each(metrics)('rejects less than 80 percent %s even when a rounded percentage says 80', (metric) => {
  const root = workspace();
  const file = report(root, metric, 7999, 10000);
  expect(() => checkCoverage(root, [file])).toThrow(new RegExp(metric));
});

test('rejects missing coverage instead of treating it as a successful empty package', () => {
  const root = workspace();
  expect(() => checkCoverage(root, [join(root, 'source.ts')])).toThrow();
});

test('rejects a report that omits an unimported production file', () => {
  const root = workspace();
  const file = report(root);
  expect(() => checkCoverage(root, [file, join(root, 'untested.ts')])).toThrow(/untested/);
});

test('rejects a report inflated by a non-production fixture', () => {
  const root = workspace();
  report(root);
  expect(() => checkCoverage(root, [])).toThrow();
});

test.each(['not JSON', '{}', '{"total":null}'])('rejects malformed coverage: %s', (content) => {
  const root = workspace();
  writeFileSync(join(root, 'coverage-summary.json'), content);
  expect(() => checkCoverage(root, [join(root, 'source.ts')])).toThrow();
});

test.each([
  ['invalid counter', { total: 5, covered: 8 }, false],
  ['missing metric', null, false],
  ['inconsistent total', { total: 8, covered: 8 }, true],
] as const)('rejects %s rather than trusting the reported percentage', (caseName, value, aggregate) => {
  const root = workspace();
  const file = report(root);
  const counts = { total: 5, covered: 5, skipped: 0, pct: 100 };
  const metrics = { statements: counts, branches: counts, functions: counts, lines: counts };
  const changed = { ...metrics, lines: value };
  const data = aggregate ? { total: changed, [file]: metrics } : { total: metrics, [file]: changed };
  writeFileSync(join(root, 'coverage-summary.json'), JSON.stringify(data));
  expect(() => checkCoverage(root, [file]), caseName).toThrow();
});

test('rejects a different file masquerading as the expected production source', () => {
  const root = workspace();
  report(root);
  expect(() => checkCoverage(root, [join(root, 'actual.ts')])).toThrow(/Unexpected coverage file/);
});

test('retains test-only regression projects in full CI execution', () => {
  const root = workspace();
  source(root, 'packages/regression/tests/integration/retained.test.ts');
  const project = { name: 'regression', root: 'packages/regression', targets: { 'test-all': {} } };
  expect(coverageProjects(root, [project])).toEqual([project]);
});
