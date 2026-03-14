import { describe, test, expect } from "vitest"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

describe("index.astro の ec-product-card 使用方法", () => {
  const src = readFileSync(resolve(__dirname, "../../src/pages/index.astro"), "utf-8")

  test("ProductCard を大文字コンポーネントとして import している", () => {
    expect(src).toMatch(/import\s+ProductCard\s+from\s+["']\.\.\/components\/ec-product-card/)
  })

  test("テンプレートで <ProductCard> を使用している（小文字 <ec-product-card> ではない）", () => {
    const template = src.split("---")[2] ?? ""
    expect(template).toContain("<ProductCard")
    expect(template).not.toMatch(/<ec-product-card[\s>]/)
  })

  test("Astro.url.searchParams から category を取得している", () => {
    expect(src).toContain("Astro.url.searchParams")
    expect(src).toMatch(/searchParams\.get\(["']category["']\)/)
  })

  test("API呼び出しに category クエリパラメータを付与している", () => {
    expect(src).toMatch(/\/api\/products\?category=/)
  })

  test("アクティブカテゴリのボタンに視覚的区別がある", () => {
    const template = src.split("---")[2] ?? ""
    expect(template).toMatch(/class:list/)
    expect(template).toMatch(/currentCategory/)
  })
})
