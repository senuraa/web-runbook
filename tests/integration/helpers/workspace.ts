import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { onTestFinished } from 'vitest';

const repository = process.cwd();
export function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'vitest-policy-'));
  onTestFinished(() => rmSync(root, { recursive: true, force: true }));
  symlinkSync(join(repository, 'node_modules'), join(root, 'node_modules'), 'dir');
  const write = (file: string, content: string) => {
    mkdirSync(dirname(join(root, file)), { recursive: true });
    writeFileSync(join(root, file), content);
  };
  write('package.json', JSON.stringify({ name: 'policy-fixture', private: true, type: 'module' }));
  write(
    'vitest.config.mts',
    `import { testingConfig } from '${repository}/tools/testing/vitest.shared.config.mts';
export default testingConfig(import.meta.dirname);\n`,
  );
  const run = (...args: string[]) => {
    rmSync(join(root, 'results.json'), { force: true });
    let status = 0;
    let output: string;
    try {
      output = execFileSync(
        process.execPath,
        [
          join(repository, 'node_modules/vitest/vitest.mjs'),
          'run',
          '--root',
          root,
          '--config',
          join(root, 'vitest.config.mts'),
          '--reporter=json',
          '--outputFile',
          join(root, 'results.json'),
          ...args,
        ],
        { cwd: root, stdio: 'pipe', encoding: 'utf8', timeout: 30000, env: { PATH: process.env.PATH, CI: 'true' } },
      );
    } catch (error) {
      const failure = error as { status: number; stdout?: string; stderr?: string };
      status = failure.status;
      output = String(failure.stdout) + String(failure.stderr);
    }
    const results = (
      existsSync(join(root, 'results.json'))
        ? JSON.parse(readFileSync(join(root, 'results.json'), 'utf8'))
        : { numTotalTests: 0, numPassedTests: 0, numFailedTests: 0 }
    ) as {
      numTotalTests: number;
      numPassedTests: number;
      numFailedTests: number;
    };
    return { status, output, results };
  };
  return { root, write, run };
}
