import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  {
    test: {
      include: ['apps/cms-api/src/**/*.test.ts'],
      exclude: ['**/e2e/**', '**/node_modules/**'],
      name: 'cms-api',
    },
  },
]);
