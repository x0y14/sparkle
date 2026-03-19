import { test, expect } from "@playwright/test"

test.describe("Figure レイアウト", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
    await page.waitForSelector("figure-header", { state: "attached" })
    await page.waitForSelector("figure-left-toolbar", { state: "attached" })
    await page.waitForSelector("figure-right-panel", { state: "attached" })
    await page.waitForFunction(() => {
      const header = document.querySelector("figure-header")
      const toolbar = document.querySelector("figure-left-toolbar")
      const panel = document.querySelector("figure-right-panel")
      return header?.shadowRoot?.innerHTML && toolbar?.shadowRoot?.innerHTML && panel?.shadowRoot?.innerHTML
    })
  })

  test("ヘッダーが画面上部に表示される(幅:全幅, 高さ:48px)", async ({ page }) => {
    const header = page.locator("figure-header")
    const box = await header.boundingBox()
    expect(box).not.toBeNull()
    expect(box!.y).toBe(0)
    expect(box!.height).toBe(48)
    const viewport = page.viewportSize()!
    expect(box!.width).toBe(viewport.width)
  })

  test("左ツールバーがヘッダーの下、左端に表示される(幅:48px)", async ({ page }) => {
    const toolbar = page.locator("figure-left-toolbar")
    const box = await toolbar.boundingBox()
    expect(box).not.toBeNull()
    expect(box!.x).toBe(0)
    expect(box!.y).toBe(48)
    expect(box!.width).toBe(48)
  })

  test("キャンバスエリアが残りの領域を埋めている", async ({ page }) => {
    const canvasArea = page.locator(".canvas-area")
    const box = await canvasArea.boundingBox()
    expect(box).not.toBeNull()
    expect(box!.x).toBe(48)
    expect(box!.y).toBe(48)
    const viewport = page.viewportSize()!
    expect(box!.width).toBe(viewport.width - 48)
    expect(box!.height).toBe(viewport.height - 48)
  })

  test("右パネルがキャンバス右側に表示される", async ({ page }) => {
    const panel = page.locator("figure-right-panel")
    const box = await panel.boundingBox()
    expect(box).not.toBeNull()
    const viewport = page.viewportSize()!
    expect(box!.x + box!.width).toBeGreaterThan(viewport.width - 30)
  })

  test("右パネルのトグルで開閉する", async ({ page }) => {
    const panel = page.locator("figure-right-panel")
    const initialBox = await panel.boundingBox()
    expect(initialBox!.width).toBeGreaterThan(200)
    const toggleBtn = panel.locator(".toggle-btn")
    await toggleBtn.click()
    await page.waitForTimeout(300)
    const collapsedBox = await panel.boundingBox()
    expect(collapsedBox!.width).toBeLessThan(100)
  })

  test("左ツールバーの+ボタンで矩形が追加される", async ({ page }) => {
    const toolbar = page.locator("figure-left-toolbar")
    const plusBtn = toolbar.locator('figure-tool-button[icon="plus"]')
    await plusBtn.click()
    await page.waitForTimeout(200)
    await expect(page.locator("canvas")).toBeVisible()
  })
})
