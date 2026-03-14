// @vitest-environment node
import { describe, test, expect } from "vitest"
import { defineElement } from "../../src/define-element.js"

describe("SSR stub _styles", () => {
  test("string styles are preserved in SSR stub", () => {
    const Comp = defineElement({ styles: "p { color: red; }" }, () => "<p>hi</p>")
    expect((Comp as any)._styles).toBe("p { color: red; }")
  })

  test("CSSStyleSheet-like object styles are preserved in SSR stub", () => {
    // Node 環境には CSSStyleSheet が無いので、cssRules を持つオブジェクトで模擬
    const mockSheet = { cssRules: [{ cssText: "p { color: blue; }" }] }
    const Comp = defineElement({ styles: mockSheet as any }, () => "<p>hi</p>")
    expect((Comp as any)._styles).toContain("p { color: blue; }")
  })

  test("CSSStyleSheet[] styles are preserved in SSR stub", () => {
    const mockSheets = [
      { cssRules: [{ cssText: "p { color: red; }" }] },
      { cssRules: [{ cssText: "h1 { font-size: 2em; }" }] },
    ]
    const Comp = defineElement({ styles: mockSheets as any }, () => "<p>hi</p>")
    expect((Comp as any)._styles).toContain("p { color: red; }")
    expect((Comp as any)._styles).toContain("h1 { font-size: 2em; }")
  })
})
