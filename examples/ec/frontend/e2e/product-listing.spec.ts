import { test, expect } from "@playwright/test"
test.describe("商品一覧", () => {
  test("SSR: 商品カードが20件表示", async ({ page }) => {
    test.setTimeout(10_000)
    await page.goto("/")
    const cards = page.locator("ec-product-card")
    await expect(cards.first()).toBeVisible()
    await expect(cards).toHaveCount(20)
  })
  test("商品クリックで詳細に遷移", async ({ page }) => {
    test.setTimeout(10_000)
    await page.goto("/")
    await page.locator("ec-product-card").first().locator("a").click()
    await expect(page).toHaveURL(/\/products\//)
  })

  test("カテゴリ「Sandals」で5件に絞り込み", async ({ page }) => {
    test.setTimeout(10_000)
    await page.goto("/")
    await page.locator("nav a", { hasText: "Sandals" }).click()
    await expect(page).toHaveURL(/\?category=sandals/)
    const cards = page.locator("ec-product-card")
    await expect(cards).toHaveCount(5)
  })

  test("選択中カテゴリのボタンにアクティブスタイル", async ({ page }) => {
    test.setTimeout(10_000)
    await page.goto("/?category=sandals")
    const activeLink = page.locator("nav a", { hasText: "Sandals" })
    await expect(activeLink).toHaveClass(/border-ink/)
  })

  test("カテゴリ別画像が表示される", async ({ page }) => {
    test.setTimeout(10_000)
    await page.goto("/?category=sandals")
    const firstImg = page.locator("ec-product-card").first().locator("img")
    await expect(firstImg).toHaveAttribute("src", "/images/flipflop-001.webp")
  })
})
