// vitest.config.ts
import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: {
    // Replaces vite-tsconfig-paths. Mirrors the `@/*` alias from tsconfig.json.
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/lib/**/*.ts'],
      exclude: [
        'src/lib/**/*.test.ts',
        'src/lib/prisma.ts',       // singleton, no logic to test
        'src/lib/defaults/**',     // covered via invariant tests
      ],
      thresholds: {
        'src/lib/dice.ts':  { lines: 80, functions: 80, branches: 70 },
        'src/lib/units.ts': { lines: 90, functions: 90, branches: 80 },
        'src/lib/utils.ts': { lines: 85, functions: 85, branches: 75 },
      },
    },
  },
});