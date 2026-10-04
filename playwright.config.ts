import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  testIgnore: ['electron/**', 'shots/**', 'audit/**'],
  fullyParallel: true,
  workers: 4,
  retries: 0,
  reporter: [['list']],
  outputDir: 'test-results/e2e',
  timeout: 60_000,
  use: {
    baseURL: 'http://localhost:4173',
    viewport: { width: 1280, height: 820 },
    trace: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 820 } },
    },
  ],
  webServer: {
    command: 'npx vite preview -c vite.web.config.ts --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
