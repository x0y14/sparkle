import { test, expect } from "@playwright/test"

test.describe("md-preview", () => {
  test("preview panel shows placeholder initially", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator("md-preview")).toContainText("Preview will appear here")
  })

  test("screenshot: preview placeholder state", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator("md-preview")).toBeVisible()
    await expect(page).toHaveScreenshot("preview-placeholder.png")
  })
})
