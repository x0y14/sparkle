import { describe, test, expect, afterEach } from "vitest";
import { renderToString } from "@sparkle/core";

function flushMicrotasks(rounds = 5): Promise<void> {
  return new Promise((r) => { let n = rounds; function s() { if (--n <= 0) r(); else queueMicrotask(s); } queueMicrotask(s); });
}

describe("ec-checkout-form", () => {
  afterEach(() => { document.body.innerHTML = ""; });

  test("SSR: ec-form-field を3つ含む (name, email, address)", async () => {
    const { default: CF } = await import("../../src/components/ec-checkout-form.js");
    const html = renderToString(CF, "ec-checkout-form", {});
    expect(html).toContain('<ec-form-field');
    expect(html).toContain('name="name"');
    expect(html).toContain('name="email"');
    expect(html).toContain('name="address"');
  });

  test("SSR: ec-order-summary を含む", async () => {
    const { default: CF } = await import("../../src/components/ec-checkout-form.js");
    const html = renderToString(CF, "ec-checkout-form", {});
    expect(html).toContain("<ec-order-summary");
  });

  test("SSR: 送信ボタン", async () => {
    const { default: CF } = await import("../../src/components/ec-checkout-form.js");
    const html = renderToString(CF, "ec-checkout-form", {});
    expect(html).toContain("注文を確定する");
    expect(html).toContain('data-action="submit"');
  });

  test("SSR: 初期エラーなし", async () => {
    const { default: CF } = await import("../../src/components/ec-checkout-form.js");
    const html = renderToString(CF, "ec-checkout-form", {});
    expect(html).not.toContain('data-testid="errors"');
  });

  test("SSR: 配送情報セクションヘッダー", async () => {
    const { default: CF } = await import("../../src/components/ec-checkout-form.js");
    const html = renderToString(CF, "ec-checkout-form", {});
    expect(html).toContain("配送情報");
  });

  test("DOM: ec-form-field 3つ存在", async () => {
    await import("../../src/context/cart-context.js");
    await import("../../src/components/ec-form-field.js");
    await import("../../src/components/ec-order-summary.js");
    await import("../../src/components/ec-checkout-form.js");
    const el = document.createElement("ec-checkout-form");
    document.body.appendChild(el);
    await flushMicrotasks();
    const fields = el.shadowRoot!.querySelectorAll("ec-form-field");
    expect(fields.length).toBe(3);
  });

  test("DOM: 送信ボタン存在", async () => {
    await import("../../src/context/cart-context.js");
    await import("../../src/components/ec-form-field.js");
    await import("../../src/components/ec-order-summary.js");
    await import("../../src/components/ec-checkout-form.js");
    const el = document.createElement("ec-checkout-form");
    document.body.appendChild(el);
    await flushMicrotasks();
    const btn = el.shadowRoot!.querySelector('[data-action="submit"]');
    expect(btn).not.toBeNull();
    expect(btn!.textContent).toContain("注文を確定する");
  });
});
