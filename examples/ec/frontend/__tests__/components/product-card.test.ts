import { describe, test, expect } from "vitest"
import { renderToString } from "@blask/core"

describe("ec-product-card", () => {
  test("SSR: DSD テンプレート生成", async () => {
    const { default: PC } = await import("../../src/components/ec-product-card.js")
    const html = renderToString(PC, "ec-product-card", {
      name: "テスト商品",
      price: 3900,
      image: "/test.webp",
      productId: "test-001",
    })
    expect(html).toContain("shadowrootmode")
    expect(html).toContain("テスト商品")
    expect(html).toContain("/test.webp")
  })

  test("SSR: 価格が日本円フォーマット", async () => {
    const { default: PC } = await import("../../src/components/ec-product-card.js")
    const html = renderToString(PC, "ec-product-card", {
      name: "商品",
      price: 12800,
      image: "/img.webp",
      productId: "p-1",
    })
    expect(html).toContain("12,800")
  })

  test("SSR: 商品詳細リンク", async () => {
    const { default: PC } = await import("../../src/components/ec-product-card.js")
    const html = renderToString(PC, "ec-product-card", {
      name: "商品",
      price: 100,
      image: "/img.webp",
      productId: "abc-123",
    })
    expect(html).toContain('href="/products/abc-123"')
  })

  test("SSR: img alt 属性", async () => {
    const { default: PC } = await import("../../src/components/ec-product-card.js")
    const html = renderToString(PC, "ec-product-card", {
      name: "テスト商品",
      price: 100,
      image: "/img.webp",
      productId: "p-1",
    })
    expect(html).toContain('alt="テスト商品"')
  })

  test("SSR: img に width/height 属性がある", async () => {
    const { default: PC } = await import("../../src/components/ec-product-card.js")
    const html = renderToString(PC, "ec-product-card", {
      name: "商品",
      price: 100,
      image: "/img.webp",
      productId: "p-1",
    })
    expect(html).toContain('width="300"')
    expect(html).toContain('height="300"')
  })

  test("SSR: :host に overflow:hidden がある", async () => {
    const { default: PC } = await import("../../src/components/ec-product-card.js")
    const html = renderToString(PC, "ec-product-card", {
      name: "商品",
      price: 100,
      image: "/img.webp",
      productId: "p-1",
    })
    expect(html).toContain("overflow-hidden")
  })

  test("SSR: img コンテナが aspect-square", async () => {
    const { default: PC } = await import("../../src/components/ec-product-card.js")
    const html = renderToString(PC, "ec-product-card", {
      name: "商品",
      price: 100,
      image: "/img.webp",
      productId: "p-1",
    })
    expect(html).toContain("aspect-square")
  })

  test("SSR: a タグに no-underline color-inherit クラス", async () => {
    const { default: PC } = await import("../../src/components/ec-product-card.js")
    const html = renderToString(PC, "ec-product-card", {
      name: "商品",
      price: 100,
      image: "/img.webp",
      productId: "p-1",
    })
    expect(html).toContain("no-underline")
    expect(html).toContain("color-inherit")
  })

  test("SSR: img に group-hover:scale-104 クラス", async () => {
    const { default: PC } = await import("../../src/components/ec-product-card.js")
    const html = renderToString(PC, "ec-product-card", {
      name: "商品",
      price: 100,
      image: "/img.webp",
      productId: "p-1",
    })
    expect(html).toContain("group-hover:scale-104")
  })
})
