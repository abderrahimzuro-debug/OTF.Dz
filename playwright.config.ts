import { defineConfig, devices } from "@playwright/test";

const port = 4173;
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  outputDir: "artifacts/test-results",
  reporter: [
    ["list"],
    ["html", { outputFolder: "artifacts/playwright-report", open: "never" }],
  ],
  use: {
    baseURL,
    locale: "ar-DZ",
    timezoneId: "Africa/Algiers",
    colorScheme: "light",
    reducedMotion: "reduce",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 1000 },
        deviceScaleFactor: 1,
      },
    },
    {
      name: "mobile",
      use: {
        ...devices["Pixel 7"],
        browserName: "chromium",
        deviceScaleFactor: 1,
      },
    },
  ],
  webServer: {
    command: `npm run preview -- --host 0.0.0.0 --port ${port} --strictPort`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    stdout: "pipe",
    stderr: "pipe",
  },
});
