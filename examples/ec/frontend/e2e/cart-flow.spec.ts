import { test, expect } from "@playwright/test";
test.describe("カートフロー", () => {
  test("商品追加 → カートで確認", async ({ page }) => {
    await page.goto("/products/san-001");
    const atc = page.locator("ec-add-to-cart");
    await atc.waitFor({ state: "visible" });
    const addBtn = atc.locator("[data-action='add-to-cart']");
    await addBtn.waitFor({ state: "visible" });
    await addBtn.click();
    await expect(addBtn).toContainText("追加しました");
    await page.goto("/cart");
    await expect(page.locator("ec-cart-item")).toHaveCount(1);
  });
});
