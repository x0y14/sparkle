import { describe, test, expect, afterEach } from "vitest"
import { renderToString } from "@sparkio/core"

function flushMicrotasks(rounds = 5): Promise<void> {
  return new Promise((r) => {
    let n = rounds
    function s() {
      if (--n <= 0) r()
      else queueMicrotask(s)
    }
    queueMicrotask(s)
  })
}

describe("ec-cart-badge", () => {
  afterEach(() => {
    document.body.innerHTML = ""
  })

  test("SSR: 0件ではバッジなし", async () => {
    const { default: CB } = await import("../../src/components/ec-cart-badge.js")
    const html = renderToString(CB, "ec-cart-badge", {})
    expect(html).toContain("<svg")
    expect(html).not.toContain("badge-count")
  })

  test("SSR: カートリンク含む", async () => {
    const { default: CB } = await import("../../src/components/ec-cart-badge.js")
    const html = renderToString(CB, "ec-cart-badge", {})
    expect(html).toContain('href="/cart"')
  })

  test("SSR: SVGアイコンが含まれる", async () => {
    const { default: CB } = await import("../../src/components/ec-cart-badge.js")
    const html = renderToString(CB, "ec-cart-badge", {})
    expect(html).toContain("<svg")
    expect(html).toContain('viewBox="0 0 24 24"')
    expect(html).not.toContain("カート")
  })

  test("DOM: Provider なしでは 0件表示", async () => {
    await import("../../src/context/cart-context.js")
    await import("../../src/components/ec-cart-badge.js")
    const el = document.createElement("ec-cart-badge")
    document.body.appendChild(el)
    await flushMicrotasks()
    expect(el.shadowRoot!.querySelector("svg")).not.toBeNull()
    expect(el.shadowRoot!.querySelector("[data-testid='badge-count']")).toBeNull()
  })
})
