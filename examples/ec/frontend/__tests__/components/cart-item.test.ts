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

describe("ec-cart-item", () => {
  afterEach(() => {
    document.body.innerHTML = ""
  })

  test("SSR: 商品名・価格・削除ボタン", async () => {
    const { default: CI } = await import("../../src/components/ec-cart-item.js")
    const html = renderToString(CI, "ec-cart-item", {
      productId: "tops-001",
      name: "テスト商品",
      price: 3900,
      quantity: 2,
      image: "/t.webp",
      stock: 10,
    })
    expect(html).toContain("テスト商品")
    expect(html).toContain("3,900")
    expect(html).toContain("削除")
  })

  test("SSR: 小計 (price * quantity)", async () => {
    const { default: CI } = await import("../../src/components/ec-cart-item.js")
    const html = renderToString(CI, "ec-cart-item", {
      productId: "p-1",
      name: "商品",
      price: 5000,
      quantity: 3,
      image: "/i.webp",
      stock: 10,
    })
    expect(html).toContain("15,000")
  })

  test("SSR: ec-quantity-selector 含む", async () => {
    const { default: CI } = await import("../../src/components/ec-cart-item.js")
    const html = renderToString(CI, "ec-cart-item", {
      productId: "p-1",
      name: "商品",
      price: 1000,
      quantity: 1,
      image: "/i.webp",
      stock: 10,
    })
    expect(html).toContain("ec-quantity-selector")
    expect(html).toContain('value="1"')
  })

  test("SSR: img に width/height 属性がある", async () => {
    const { default: CI } = await import("../../src/components/ec-cart-item.js")
    const html = renderToString(CI, "ec-cart-item", {
      productId: "p-1",
      name: "商品",
      price: 1000,
      quantity: 1,
      image: "/i.webp",
      stock: 10,
    })
    expect(html).toContain('width="96"')
    expect(html).toContain('height="120"')
  })

  test("DOM: 削除ボタン存在", async () => {
    await import("../../src/context/cart-context.js")
    await import("../../src/components/ec-quantity-selector.js")
    await import("../../src/components/ec-cart-item.js")
    const el = document.createElement("ec-cart-item") as any
    el.setAttribute("product-id", "tops-001")
    el.setAttribute("name", "テスト")
    el.setAttribute("price", "3900")
    el.setAttribute("quantity", "1")
    el.setAttribute("image", "/t.webp")
    el.setAttribute("stock", "10")
    document.body.appendChild(el)
    await flushMicrotasks()
    const btn = el.shadowRoot!.querySelector("[data-action='remove']")
    expect(btn).not.toBeNull()
    expect(btn.textContent).toContain("削除")
  })
})
