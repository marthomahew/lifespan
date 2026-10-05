import { defineConfig } from '@playwright/test';

/** The fresh-eyes audit lives (DONE §7); not part of verify. */
export default defineConfig({
  testDir: './e2e/audit',
  workers: 3,
  retries: 0,
  reporter: [['list']],
  outputDir: 'test-results/audit',
  timeout: 900_000,
  use: {
    // Tests click through hundreds of dialogs; they don't need to wait out entrance animations.
    reducedMotion: 'reduce',
    baseURL: 'http://localhost:4173',
    viewport: { width: 1280, height: 820 },
  },
  webServer: {
    command: 'npx vite preview -c vite.web.config.ts --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
