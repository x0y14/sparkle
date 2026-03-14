import { describe, test, expect } from "vitest"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

describe("BaseLayout.astro のヘッダー構成", () => {
  const src = readFileSync(resolve(__dirname, "../../src/layouts/BaseLayout.astro"), "utf-8")

  test("Black EC ロゴリンクが存在する", () => {
    expect(src).toContain("Black EC")
    expect(src).toMatch(/href="\/"/)
  })

  test("nav 内に商品一覧リンクが存在しない", () => {
    expect(src).not.toContain("商品一覧")
  })

  test("nav 内に CartBadge コンポーネントが存在する", () => {
    expect(src).toContain("<CartBadge")
  })
})
