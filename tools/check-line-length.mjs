import { execFileSync } from 'node:child_process';
import { existsSync, lstatSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { relativePath, repositoryRoot, requiresLineLengthCheck } from './lint-policy.mjs';

const specifiedFiles = process.argv.slice(2);
const files = specifiedFiles.length
  ? specifiedFiles
  : execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], {
      cwd: repositoryRoot,
      encoding: 'utf8',
    })
      .split('\0')
      .filter(Boolean)
      .map((file) => resolve(repositoryRoot, file));

let violations = 0;
for (const file of new Set(files)) {
  if (!existsSync(file) || !lstatSync(file).isFile() || !requiresLineLengthCheck(file)) {
    continue;
  }
  const lines = readFileSync(file, 'utf8').split(/\r\n|\n|\r/u);
  for (const [index, line] of lines.entries()) {
    const length = [...line].length;
    if (length > 120) {
      console.error(`${relativePath(file)}:${index + 1}:121: Line has ${length} characters; maximum is 120.`);
      violations += 1;
    }
  }
}

if (violations > 0) {
  process.exitCode = 1;
} else {
  console.log('Line length check passed (120-character maximum for source, tests, and configuration).');
}
