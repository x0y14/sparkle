import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    environment: "happy-dom",
    include: ["__tests__/**/*.test.ts"],
    exclude: ["__tests__/e2e/**"],
    passWithNoTests: true,
  },
})
