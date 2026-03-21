import { test, expect } from "@playwright/test"

test.describe("Markdoc Live Preview integration", () => {
  test("page loads with editor and preview", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator("md-live-preview")).toBeVisible()
    await expect(page.locator("md-editor")).toBeVisible()
    await expect(page.locator("md-preview")).toBeVisible()
  })

  test("renders heading in real-time on input", async ({ page }) => {
    await page.goto("/")
    const textarea = page.locator("md-editor textarea")
    await textarea.fill("# Hello World")
    await expect(page.locator("md-preview h1")).toHaveText("Hello World")
  })

  test("renders list in real-time on input", async ({ page }) => {
    await page.goto("/")
    const textarea = page.locator("md-editor textarea")
    await textarea.fill("- Item 1\n- Item 2")
    const items = page.locator("md-preview li")
    await expect(items).toHaveCount(2)
    await expect(items.first()).toHaveText("Item 1")
  })

  test("highlights corresponding element on cursor position", async ({ page }) => {
    await page.goto("/")
    const textarea = page.locator("md-editor textarea")
    await textarea.fill("# Hello\n\nSome paragraph")
    await expect(page.locator("md-preview h1")).toBeVisible()
    await textarea.click()
    await textarea.press("Home")
    await expect(page.locator("md-preview .highlight-active")).toBeVisible()
  })

  test("highlights inline element precisely", async ({ page }) => {
    await page.goto("/")
    const textarea = page.locator("md-editor textarea")
    await textarea.fill("**bold** and *italic*")
    await expect(page.locator("md-preview strong")).toBeVisible()
    await textarea.click()
    await textarea.press("Home")
    await expect(page.locator("md-preview strong.highlight-active")).toBeVisible()
  })

  test("clicking preview element moves editor cursor", async ({ page }) => {
    await page.goto("/")
    const textarea = page.locator("md-editor textarea")
    await textarea.fill("# Hello\n\nSome paragraph")
    await expect(page.locator("md-preview h1")).toBeVisible()
    await page.locator("md-preview h1").click()
    const cursorPos = await textarea.evaluate((el: HTMLTextAreaElement) => el.selectionStart)
    expect(cursorPos).toBe(8)
  })

  test("hovering preview element adds highlight-hover", async ({ page }) => {
    await page.goto("/")
    const textarea = page.locator("md-editor textarea")
    await textarea.fill("# Hello\n\nSome paragraph")
    await expect(page.locator("md-preview h1")).toBeVisible()
    await page.locator("md-preview h1").hover()
    await expect(page.locator("md-preview .highlight-hover")).toBeVisible()
  })

  test("screenshot: after real-time rendering", async ({ page }) => {
    await page.goto("/")
    const textarea = page.locator("md-editor textarea")
    await textarea.fill("# Hello\n\nThis is a **bold** paragraph.\n\n- Item 1\n- Item 2\n\n```\nconst x = 1\n```")
    await expect(page.locator("md-preview h1")).toBeVisible()
    await expect(page).toHaveScreenshot("after-preview.png")
  })

  test("screenshot: highlight active", async ({ page }) => {
    await page.goto("/")
    const textarea = page.locator("md-editor textarea")
    await textarea.fill("# Hello\n\nSome **bold** text\n\n- Item 1\n- Item 2")
    await expect(page.locator("md-preview h1")).toBeVisible()
    await textarea.click()
    await textarea.press("Home")
    await expect(page.locator("md-preview .highlight-active")).toBeVisible()
    await expect(page).toHaveScreenshot("highlight-active.png")
  })
})
