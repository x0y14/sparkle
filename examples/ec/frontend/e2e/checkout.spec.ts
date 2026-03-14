import { test, expect } from "@playwright/test";
test.describe("チェックアウト", () => {
  test("バリデーションエラー表示", async ({ page }) => {
    await page.goto("/products/san-001");
    await page.locator("ec-add-to-cart [data-action='add-to-cart']").click();
    await page.waitForTimeout(500);
    await page.goto("/checkout");
    const form = page.locator("ec-checkout-form");
    await form.waitFor({ state: "visible" });
    await form.locator("[data-action='submit']").click();
    await expect(form.locator("[data-testid='errors']")).toBeVisible();
  });
});
