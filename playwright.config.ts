import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './__tests__',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5174',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'api',
      testMatch: '**/api/**/*.spec.ts',
      use: { baseURL: 'http://localhost:3001/api/v1' },
    },
    {
      name: 'e2e',
      testMatch: '**/e2e/**/*.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'cd server && npm run dev',
      url: 'http://localhost:3001/api/v1/health',
      reuseExistingServer: true,
      timeout: 60000,
    },
    {
      command: 'cd client && npm run dev',
      url: 'http://localhost:5174',
      reuseExistingServer: true,
      timeout: 60000,
    },
  ],
});
