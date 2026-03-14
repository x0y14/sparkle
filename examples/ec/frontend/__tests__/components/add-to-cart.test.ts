import { describe, test, expect, afterEach } from "vitest";
import { renderToString } from "@sparkle/core";

function flushMicrotasks(rounds = 5): Promise<void> {
  return new Promise((r) => { let n = rounds; function s() { if (--n <= 0) r(); else queueMicrotask(s); } queueMicrotask(s); });
}

describe("ec-add-to-cart", () => {
  afterEach(() => { document.body.innerHTML = ""; });

  test("SSR: DSD にボタンと quantity-selector", async () => {
    const { default: AC } = await import("../../src/components/ec-add-to-cart.js");
    const html = renderToString(AC, "ec-add-to-cart", { productId: "t-001", stock: 10, price: 3900 });
    expect(html).toContain("shadowrootmode");
    expect(html).toContain("カートに追加");
    expect(html).toContain("ec-quantity-selector");
  });

  test("SSR: stock が max に設定", async () => {
    const { default: AC } = await import("../../src/components/ec-add-to-cart.js");
    const html = renderToString(AC, "ec-add-to-cart", { productId: "t-001", stock: 15, price: 3900 });
    expect(html).toContain('max="15"');
  });

  test("DOM: ボタン表示", async () => {
    await import("../../src/components/ec-quantity-selector.js");
    await import("../../src/components/ec-add-to-cart.js");
    const el = document.createElement("ec-add-to-cart") as any;
    el.setAttribute("product-id", "t-001"); el.setAttribute("stock", "10"); el.setAttribute("price", "3900");
    document.body.appendChild(el);
    await flushMicrotasks();
    const btn = el.shadowRoot!.querySelector("[data-action='add-to-cart']");
    expect(btn).not.toBeNull();
    expect(btn.textContent).toContain("カートに追加");
  });

  test("DOM: ec-quantity-selector が Shadow DOM 内に存在", async () => {
    await import("../../src/components/ec-quantity-selector.js");
    await import("../../src/components/ec-add-to-cart.js");
    const el = document.createElement("ec-add-to-cart") as any;
    el.setAttribute("product-id", "t-001"); el.setAttribute("stock", "10"); el.setAttribute("price", "3900");
    document.body.appendChild(el);
    await flushMicrotasks();
    expect(el.shadowRoot!.querySelector("ec-quantity-selector")).not.toBeNull();
  });
});
