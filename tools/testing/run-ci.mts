import { createProjectGraphAsync } from '@nx/devkit';
import { appendFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { executeNx, runCoverage } from './coverage-runner.mts';

const root = resolve(import.meta.dirname, '../..');
mkdirSync(resolve(root, 'coverage'), { recursive: true });
try {
  const graph = await createProjectGraphAsync();
  const projects = Object.values(graph.nodes).map((node) => ({ ...node.data, name: node.name }));
  const result = runCoverage(root, projects, (project, directory, collectCoverage) =>
    executeNx(root, project, directory, collectCoverage),
  );
  writeFileSync(resolve(root, 'coverage/summary.md'), result.summary);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, result.summary);
  console.log(result.summary);
  process.exitCode = result.success ? 0 : 1;
} catch (error) {
  console.error('Coverage validation failed:', error);
  process.exitCode = 1;
}
