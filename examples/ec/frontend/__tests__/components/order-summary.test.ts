import { describe, test, expect, afterEach } from "vitest";
import { renderToString } from "@sparkle/core";

function flushMicrotasks(rounds = 5): Promise<void> {
  return new Promise((r) => { let n = rounds; function s() { if (--n <= 0) r(); else queueMicrotask(s); } queueMicrotask(s); });
}

describe("ec-order-summary", () => {
  afterEach(() => { document.body.innerHTML = ""; });

  test("SSR: 注文内容ヘッダー", async () => {
    const { default: OS } = await import("../../src/components/ec-order-summary.js");
    const html = renderToString(OS, "ec-order-summary", {});
    expect(html).toContain("注文内容");
  });

  test("SSR: 合計表示", async () => {
    const { default: OS } = await import("../../src/components/ec-order-summary.js");
    const html = renderToString(OS, "ec-order-summary", {});
    expect(html).toContain("合計");
  });

  test("SSR: 空カート状態", async () => {
    const { default: OS } = await import("../../src/components/ec-order-summary.js");
    const html = renderToString(OS, "ec-order-summary", {});
    expect(html).toContain("カートは空です");
  });

  test("DOM: ec-order-summary が shadowRoot を持つ", async () => {
    await import("../../src/context/cart-context.js");
    await import("../../src/components/ec-order-summary.js");
    const el = document.createElement("ec-order-summary");
    document.body.appendChild(el);
    await flushMicrotasks();
    expect(el.shadowRoot).not.toBeNull();
    expect(el.shadowRoot!.textContent).toContain("注文内容");
    expect(el.shadowRoot!.textContent).toContain("合計");
  });
});
