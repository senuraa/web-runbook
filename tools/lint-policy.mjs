import { basename, extname, matchesGlob, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const repositoryRoot = fileURLToPath(new URL('../', import.meta.url));

// Nx-generated agent integrations are maintained by Nx, not handwritten project code.
export const ignoredPaths = [
  '**/node_modules/**',
  '**/dist/**',
  '**/coverage/**',
  '**/generated/**',
  '**/*.generated.*',
  '**/*.gen.*',
  '.nx/**',
  '.agents/**',
  '.codex/**',
  '.github/skills/**',
  '**/pnpm-lock.yaml',
  '**/package-lock.json',
  '**/yarn.lock',
  '**/bun.lock',
];

const extensions = new Set([
  '.js',
  '.mjs',
  '.cjs',
  '.jsx',
  '.ts',
  '.mts',
  '.cts',
  '.tsx',
  '.json',
  '.jsonc',
  '.json5',
  '.yaml',
  '.yml',
  '.toml',
  '.ini',
  '.properties',
  '.xml',
  '.css',
  '.scss',
  '.less',
  '.html',
  '.vue',
  '.svelte',
  '.graphql',
  '.gql',
  '.sh',
  '.bash',
  '.zsh',
]);
const configurationNames = new Set(['.editorconfig', '.gitignore', '.gitattributes', '.npmrc', 'Dockerfile']);

export function relativePath(file) {
  return relative(repositoryRoot, resolve(file)).replaceAll('\\', '/');
}

export function requiresLineLengthCheck(file) {
  const path = relativePath(file);
  if (path.startsWith('../') || ignoredPaths.some((pattern) => matchesGlob(path, pattern))) {
    return false;
  }
  return extensions.has(extname(path)) || configurationNames.has(basename(path)) || path.startsWith('.husky/');
}
