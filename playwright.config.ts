import { defineConfig, devices } from "@playwright/test";

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

/**
 * E2E config. Boots the Next dev server (which reads .env.local for Sanity
 * credentials) and runs render-level smoke specs against it. Specs assert on
 * deterministic copy/structure, not on CMS-provided URL values, so they stay
 * green as the owner edits content.
 *
 * Requires CMS connectivity: the welcome/services pages fetch siteSettings from
 * Sanity and throw if it's missing. If Sanity is unreachable in your env, the
 * dev server will 500 on those routes and these specs will fail by design.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: "npm run dev",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
