import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { afterEach, expect, test } from 'vitest';
import { runCoverage } from './coverage-runner.mts';

const roots: string[] = [];
afterEach(() => roots.splice(0).forEach((root) => rmSync(root, { recursive: true, force: true })));
function workspace(names = ['a']) {
  const root = mkdtempSync(join(tmpdir(), 'coverage-runner-'));
  roots.push(root);
  const projects = names.map((name) => {
    mkdirSync(join(root, 'packages', name, 'src'), { recursive: true });
    writeFileSync(join(root, 'packages', name, 'src/index.ts'), 'export const value = 1;\n');
    return { name, root: `packages/${name}`, targets: { 'test-all': {} } };
  });
  return { root, projects };
}
// This substitutes the external Nx process boundary; real files exercise the runner's validation.
function writeReport(directory: string, source: string, covered = 5) {
  mkdirSync(directory, { recursive: true });
  const counts = { total: 5, covered, skipped: 0, pct: covered * 20 };
  const metrics = { statements: counts, branches: counts, functions: counts, lines: counts };
  writeFileSync(join(directory, 'coverage-summary.json'), JSON.stringify({ total: metrics, [source]: metrics }));
  writeFileSync(join(directory, 'index.html'), '<html>coverage</html>');
  writeFileSync(join(directory, 'coverage-final.json'), '{}');
}

test('runs each production package once and rejects a low package despite high coverage elsewhere', () => {
  const { root, projects } = workspace(['a', 'b']);
  const executed: string[] = [];
  const result = runCoverage(root, projects, (project, directory) => {
    executed.push(project.name);
    writeReport(directory, join(root, project.root, 'src/index.ts'), project.name === 'a' ? 5 : 3);
    return 0;
  });
  expect(executed).toEqual(['a', 'b']);
  expect(result.success).toBe(false);
  expect(result.summary).toContain('b');
  expect(result.summary).toContain('below 80%');
});

test('clears stale coverage before execution and fails when new reports are missing', () => {
  const { root, projects } = workspace();
  const directory = join(root, 'coverage/packages/a');
  writeReport(directory, join(root, 'packages/a/src/index.ts'));
  const result = runCoverage(root, projects, () => 0);
  expect(result.success).toBe(false);
  expect(existsSync(join(directory, 'coverage-summary.json'))).toBe(false);
});

test('a failed test cannot be hidden by valid high coverage or successful report publication', () => {
  const { root, projects } = workspace();
  const result = runCoverage(root, projects, (project, directory) => {
    writeReport(directory, join(root, project.root, 'src/index.ts'));
    return 1;
  });
  expect(result.success).toBe(false);
  expect(result.summary).toContain('test');
  expect(existsSync(join(root, 'coverage/packages/a/index.html'))).toBe(true);
});

test('a valid combined run succeeds and reports all four coverage metrics', () => {
  const { root, projects } = workspace();
  const result = runCoverage(root, projects, (project, directory) => {
    writeReport(directory, join(root, project.root, 'src/index.ts'), 4);
    return 0;
  });
  expect(result.success).toBe(true);
  expect(result.summary).toContain('80.00%');
  expect(result.summary).toContain('branches');
});

test('a missing report artifact or execution exception blocks validation', () => {
  const { root, projects } = workspace();
  const missing = runCoverage(root, projects, (project, directory) => {
    writeReport(directory, join(root, project.root, 'src/index.ts'));
    rmSync(join(directory, 'index.html'));
    return 0;
  });
  expect(missing.success).toBe(false);
  const failure = runCoverage(root, projects, () => {
    throw new Error('process failed');
  });
  expect(failure.success).toBe(false);
  expect(failure.summary).toContain('process failed');
});

test('empty scaffolding reports that no product suites exist without claiming coverage', () => {
  const { root } = workspace([]);
  const result = runCoverage(root, [], () => {
    throw new Error('must not execute');
  });
  expect(result.success).toBe(true);
  expect(result.summary).toContain('No production packages');
  expect(result.summary).not.toContain('100%');
});

test('a failing test-only regression project blocks CI without requiring fictitious coverage', () => {
  const { root, projects } = workspace();
  rmSync(join(root, 'packages/a/src'), { recursive: true });
  mkdirSync(join(root, 'packages/a/tests/integration'), { recursive: true });
  writeFileSync(join(root, 'packages/a/tests/integration/retained.test.ts'), '');
  const result = runCoverage(root, projects, () => 1);
  expect(result.success).toBe(false);
  expect(result.summary).toContain('a');
});

test.each(['invalid JSON', 'HTML directory'])('rejects an unusable report artifact: %s', (failure) => {
  const { root, projects } = workspace();
  const result = runCoverage(root, projects, (project, directory) => {
    writeReport(directory, join(root, project.root, 'src/index.ts'));
    if (failure === 'invalid JSON') writeFileSync(join(directory, 'coverage-final.json'), 'not JSON');
    else {
      rmSync(join(directory, 'index.html'));
      mkdirSync(join(directory, 'index.html'));
    }
    return 0;
  });
  expect(result.success).toBe(false);
});

test('runs a passing test-only project and reports coverage as not applicable', () => {
  const { root, projects } = workspace();
  rmSync(join(root, 'packages/a/src'), { recursive: true });
  mkdirSync(join(root, 'packages/a/tests/integration'), { recursive: true });
  writeFileSync(join(root, 'packages/a/tests/integration/retained.test.ts'), '');
  const executed: string[] = [];
  const result = runCoverage(root, projects, (project) => {
    executed.push(project.name);
    return 0;
  });
  expect(executed).toEqual(['a']);
  expect(result.success).toBe(true);
  expect(result.summary).toContain('N/A');
});
