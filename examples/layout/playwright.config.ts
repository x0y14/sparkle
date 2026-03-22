import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "e2e",
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: false,
  workers: 1,
  use: { baseURL: "http://localhost:4600", ...devices["Desktop Chrome"] },
  webServer: {
    command: "pnpm dev",
    port: 4600,
    timeout: 30_000,
    reuseExistingServer: true,
  },
})
