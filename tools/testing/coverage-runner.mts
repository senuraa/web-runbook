import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { readFileSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { checkCoverage, coverageProjects, productionFiles } from './coverage-policy.mts';
import type { Project } from './coverage-policy.mts';

export type Execute = (project: Project, directory: string, collectCoverage: boolean) => number;
export function runCoverage(root: string, projects: Project[], execute: Execute) {
  const eligible = coverageProjects(root, projects);
  let success = true;
  const rows = ['# Test coverage', ''];
  if (!eligible.some((project) => project.root !== '.' && productionFiles(root, project.root).length)) {
    rows.push('', 'No production packages exist yet; repository tooling tests are reported separately.', '');
  }
  rows.push('| Project | statements | branches | functions | lines | Result |');
  rows.push('| --- | --- | --- | --- | --- | --- |');
  for (const project of eligible) {
    const directory = join(root, 'coverage', project.root === '.' ? 'repository' : project.root);
    try {
      rmSync(directory, { recursive: true, force: true });
      const files = productionFiles(root, project.root);
      const status = execute(project, directory, files.length > 0);
      if (status !== 0) throw new Error('test or coverage command failed; inspect the test log and available reports.');
      if (!files.length) {
        rows.push(`| ${project.name} | N/A | N/A | N/A | N/A | Passed (no production sources) |`);
        continue;
      }
      const metrics = checkCoverage(directory, files);
      for (const artifact of ['index.html', 'coverage-final.json']) {
        const path = join(directory, artifact);
        if (!statSync(path).isFile()) throw new Error(`Coverage artifact is not a regular file: ${artifact}`);
        const content = readFileSync(path, 'utf8');
        if (!content.trim()) throw new Error(`Empty coverage artifact: ${artifact}`);
        if (artifact.endsWith('.json')) JSON.parse(content);
      }
      const values = ['statements', 'branches', 'functions', 'lines'].map((name) => `${metrics[name].toFixed(2)}%`);
      rows.push(`| ${project.name} | ${values.join(' | ')} | Passed |`);
    } catch (error) {
      success = false;
      const message = String(error).replaceAll('|', '\\|').replaceAll('\n', ' ');
      rows.push(`| ${project.name} | — | — | — | — | Failed: ${message} |`);
    }
  }
  return { success, summary: rows.join('\n') + '\n' };
}

export function executeNx(root: string, project: Project, directory: string, collectCoverage = true): number {
  const nx = createRequire(import.meta.url).resolve('nx/bin/nx.js');
  try {
    execFileSync(
      process.execPath,
      [
        nx,
        'run',
        `${project.name}:test-all`,
        '--skipNxCache',
        '--outputStyle=static',
        ...(collectCoverage ? ['--coverage', `--coverage.reportsDirectory=${directory}`] : []),
      ],
      { cwd: root, stdio: 'inherit', env: { ...process.env, NX_DAEMON: 'false', NX_WORKSPACE_ROOT: root } },
    );
    return 0;
  } catch {
    return 1;
  }
}
