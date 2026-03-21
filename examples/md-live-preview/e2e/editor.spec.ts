import { test, expect } from "@playwright/test"

test.describe("md-editor", () => {
  test("textarea is visible on page load", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator("md-editor textarea")).toBeVisible()
  })

  test("can type into textarea", async ({ page }) => {
    await page.goto("/")
    const textarea = page.locator("md-editor textarea")
    await textarea.fill("# Hello")
    await expect(textarea).toHaveValue("# Hello")
  })

  test("screenshot: editor initial state", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator("md-live-preview")).toBeVisible()
    await expect(page).toHaveScreenshot("editor-initial.png")
  })
})
