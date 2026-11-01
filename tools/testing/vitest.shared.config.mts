import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';
import { productionExclusions, sourceExtensions, testExclusions } from './coverage-policy.mts';

export function testingConfig(root: string, source = 'src') {
  return defineConfig({
    root,
    test: {
      environment: 'node',
      globals: false,
      watch: false,
      allowOnly: false,
      passWithNoTests: false,
      retry: 0,
      include: [`${source}/**/*.test.ts`, 'tests/integration/**/*.test.ts'],
      exclude: testExclusions,
      setupFiles: [resolve(import.meta.dirname, 'fixtures/setup.mts')],
      clearMocks: true,
      mockReset: true,
      restoreMocks: true,
      unstubEnvs: true,
      unstubGlobals: true,
      coverage: {
        provider: 'v8',
        include: [source === 'src' ? `**/*.${sourceExtensions}` : `${source}/**/*.${sourceExtensions}`],
        exclude: productionExclusions,
        reportsDirectory: resolve(root, 'coverage'),
        reporter: ['text', 'html', 'json', 'json-summary'],
        reportOnFailure: true,
        thresholds: { statements: 80, branches: 80, functions: 80, lines: 80 },
      },
    },
  });
}
