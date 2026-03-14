import { defineConfig } from "@playwright/test";

// Vite が非TTY環境で stdout.clearLine を呼び出してエラーになるのを防ぐ
// 参照: refs/astro/packages/astro/playwright.config.js:4-5
process.stdout.isTTY = false;

const PORT = 4399; // 4321 は他プロジェクトと衝突する可能性があるため別ポートを使用

export default defineConfig({
  testDir: "./__tests__/e2e",
  testMatch: "*.test.ts",
  timeout: 30_000,
  expect: { timeout: 5_000 },
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  use: {
    baseURL: `http://localhost:${PORT}`,
    browserName: "chromium",
    headless: true,
  },
  webServer: {
    command: `pnpm astro dev --root ./__tests__/e2e/fixtures/sparkle-basics --port ${PORT}`,
    port: PORT,
    timeout: 30_000,
    reuseExistingServer: false,
  },
});
