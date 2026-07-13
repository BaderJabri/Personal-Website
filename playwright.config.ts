process.env.PLAYWRIGHT_BROWSERS_PATH ??= "0";

import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL: "http://localhost:4173",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "node scripts/serve-out.mjs 4173",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI,
  },
});
