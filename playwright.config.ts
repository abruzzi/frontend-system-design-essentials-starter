import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e", // Where to find E2E tests
  fullyParallel: true, // Run tests in parallel
  forbidOnly: !!process.env.CI, // Prevent accidental .only() in CI
  retries: process.env.CI ? 2 : 0, // Retry failed tests in CI
  workers: process.env.CI ? 1 : undefined, // Limit workers in CI
  reporter: "html", // Generate HTML report
  use: {
    baseURL: "http://localhost:5173", // Base URL for page.goto('/')
    trace: "on-first-retry", // Capture trace on retry
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev", // Start dev server
    url: "http://localhost:5173", // Wait for this URL
    reuseExistingServer: !process.env.CI, // Reuse server in local dev
  },
});
