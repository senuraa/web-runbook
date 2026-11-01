import { existsSync, globSync, readdirSync, readFileSync, realpathSync } from 'node:fs';
import { join, resolve } from 'node:path';

export interface Project {
  name: string;
  root: string;
  targets?: Record<string, unknown>;
}

export const sourceExtensions = '{ts,tsx,mts,cts,js,jsx,mjs,cjs}';
export const testExclusions = [
  '**/node_modules/**',
  '**/fixtures/**',
  '**/__fixtures__/**',
  '**/dist/**',
  '**/generated/**',
];
export const productionExclusions = [
  '**/node_modules/**',
  '**/dist/**',
  '**/out-tsc/**',
  '**/coverage/**',
  '**/tests/**',
  '**/fixtures/**',
  '**/__fixtures__/**',
  '**/generated/**',
  '**/*.generated.*',
  '**/*.gen.*',
  '**/*.{test,spec}.*',
  '**/*.d.{ts,mts,cts}',
  '**/*.config.*',
];

export function productionFiles(root: string, projectRoot: string): string[] {
  const pattern = projectRoot === '.' ? `tools/testing/**/*.${sourceExtensions}` : `**/*.${sourceExtensions}`;
  return globSync(pattern, { cwd: resolve(root, projectRoot), exclude: productionExclusions })
    .map((file) => resolve(root, projectRoot, file))
    .sort();
}

function hasTests(root: string, projectRoot: string): boolean {
  const source = projectRoot === '.' ? 'tools/testing' : 'src';
  return (
    globSync([`${source}/**/*.test.ts`, 'tests/integration/**/*.test.ts'], {
      cwd: resolve(root, projectRoot),
      exclude: testExclusions,
    }).length > 0
  );
}

export function coverageProjects(root: string, projects: Project[]): Project[] {
  const packages = join(root, 'packages');
  if (existsSync(packages)) {
    for (const entry of readdirSync(packages, { withFileTypes: true })) {
      const path = `packages/${entry.name}`;
      if (
        entry.isDirectory() &&
        (productionFiles(root, path).length || hasTests(root, path)) &&
        !projects.some((p) => p.root === path)
      ) {
        throw new Error(`${path}: package with production code or tests is missing from the Nx graph.`);
      }
    }
  }
  return projects.filter((project) => {
    if (!productionFiles(root, project.root).length && !hasTests(root, project.root)) return false;
    if (!project.targets?.['test-all']) {
      throw new Error(`${project.name}: production code or tests require a test-all target.`);
    }
    return true;
  });
}

const metrics = ['statements', 'branches', 'functions', 'lines'] as const;

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Malformed coverage report: expected an object.');
  }
  return value as Record<string, unknown>;
}

function canonicalPath(file: string): string {
  return existsSync(file) ? realpathSync(file) : resolve(file);
}

export function checkCoverage(directory: string, files: string[]): Record<string, number> {
  const report = record(JSON.parse(readFileSync(join(directory, 'coverage-summary.json'), 'utf8')));
  const expected = new Set(files.map(canonicalPath));
  const reported = Object.keys(report).filter((file) => file !== 'total');
  if (!expected.size || reported.length !== expected.size) {
    throw new Error(`Coverage file set differs from production sources: ${files.join(', ')}`);
  }
  for (const file of reported) {
    if (!expected.delete(canonicalPath(file))) throw new Error(`Unexpected coverage file: ${file}`);
  }
  if (expected.size) throw new Error(`Missing production coverage: ${[...expected].join(', ')}`);
  const percentages: Record<string, number> = {};
  const totals = record(report.total);
  for (const metric of metrics) {
    let total = 0;
    let covered = 0;
    for (const file of reported) {
      const entry = record(record(report[file])[metric]);
      if (
        typeof entry.total !== 'number' ||
        !Number.isSafeInteger(entry.total) ||
        entry.total < 0 ||
        typeof entry.covered !== 'number' ||
        !Number.isSafeInteger(entry.covered) ||
        entry.covered < 0 ||
        entry.covered > entry.total
      )
        throw new Error(`Malformed ${metric} coverage for ${file}`);
      total += entry.total;
      covered += entry.covered;
    }
    const aggregate = record(totals[metric]);
    if (aggregate.total !== total || aggregate.covered !== covered) {
      throw new Error(`Inconsistent ${metric} coverage totals.`);
    }
    const percentage = total === 0 ? 100 : (covered / total) * 100;
    if (percentage < 80) throw new Error(`${metric} coverage ${percentage.toFixed(2)}% is below 80%.`);
    percentages[metric] = percentage;
  }
  return percentages;
}
