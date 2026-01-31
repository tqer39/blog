import { defineConfig, devices } from '@playwright/test';

const DOCS_PORT = 3103;
const DOCS_URL = `http://localhost:${DOCS_PORT}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? 'github' : 'html',
  use: {
    baseURL: DOCS_URL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Launch in incognito mode to avoid extension interference
        contextOptions: {
          // No extensions in default context
        },
      },
    },
  ],
  webServer: {
    command: 'pnpm preview',
    url: DOCS_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
