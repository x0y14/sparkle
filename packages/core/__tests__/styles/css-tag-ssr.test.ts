// @vitest-environment node
import { describe, test, expect } from "vitest"

describe("css tag (SSR / Node.js)", () => {
  test("css tag does not crash in Node.js", async () => {
    const { css } = await import("../../src/styles/css-tag.js")
    expect(() => css`p { color: red; }`).not.toThrow()
  })

  test("CSSResult.cssText preserves CSS text", async () => {
    const { css, CSSResult } = await import("../../src/styles/css-tag.js")
    const result = css`p { color: red; }`
    expect(result).toBeInstanceOf(CSSResult)
    expect(result.cssText).toBe("p { color: red; }")
  })

  test("CSSResult.cssText handles interpolation", async () => {
    const { css } = await import("../../src/styles/css-tag.js")
    const color = "blue"
    const result = css`p { color: ${color}; }`
    expect(result.cssText).toBe("p { color: blue; }")
  })

  test("CSSResult.styleSheet throws in Node.js (no CSSStyleSheet)", async () => {
    const { css } = await import("../../src/styles/css-tag.js")
    const result = css`p { color: red; }`
    // Node.js には CSSStyleSheet が無いため styleSheet getter が throw する
    expect(() => result.styleSheet).toThrow()
  })
})
