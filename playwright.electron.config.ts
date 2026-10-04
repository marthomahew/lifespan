import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/electron',
  workers: 1,
  retries: 0,
  reporter: [['list']],
  outputDir: 'test-results/electron',
  timeout: 90_000,
});
