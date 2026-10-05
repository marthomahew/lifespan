import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/shots',
  workers: 2,
  retries: 0,
  reporter: [['list']],
  outputDir: 'test-results/shots',
  timeout: 120_000,
  use: {
    // Tests click through hundreds of dialogs; they don't need to wait out entrance animations.
    reducedMotion: 'reduce',
    baseURL: 'http://localhost:4173',
  },
  webServer: {
    command: 'npx vite preview -c vite.web.config.ts --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
