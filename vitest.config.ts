import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    exclude: ['src/motion/**', 'src/ask/**', 'src/billing/**'],
    environment: 'node',
  },
});
