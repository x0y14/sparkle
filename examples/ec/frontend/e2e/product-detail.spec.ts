import { test, expect } from "@playwright/test";
test.describe("商品詳細", () => {
  test("商品名が表示されカート追加ボタンが存在", async ({ page }) => {
    await page.goto("/products/san-001");
    await expect(page.getByText("EVAクロッグサンダル")).toBeVisible();
    const addBtn = page.locator("ec-add-to-cart");
    await expect(addBtn).toBeVisible();
  });
});
