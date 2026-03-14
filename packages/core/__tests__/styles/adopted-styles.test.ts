import { describe, test, expect } from "vitest"
import { createSharedSheet } from "../../src/styles/create-shared-sheet.js"
import { adoptUnoCSS } from "../../src/styles/adopt-uno-css.js"
import { css, CSSResult } from "../../src/styles/css-tag.js"

describe("createSharedSheet", () => {
  test("CSSStyleSheet with rules", () => {
    const sheet = createSharedSheet("p { color: red; }")
    expect(sheet).toBeInstanceOf(CSSStyleSheet)
    expect(sheet.cssRules.length).toBeGreaterThan(0)
  })

  test("reusable across shadow roots", () => {
    const sheet = createSharedSheet("p { color: blue; }")
    const el1 = document.createElement("div")
    const el2 = document.createElement("div")
    const sr1 = el1.attachShadow({ mode: "open" })
    const sr2 = el2.attachShadow({ mode: "open" })

    sr1.adoptedStyleSheets = [sheet]
    sr2.adoptedStyleSheets = [sheet]

    expect(sr1.adoptedStyleSheets[0]).toBe(sr2.adoptedStyleSheets[0])
  })
})

describe("adoptUnoCSS", () => {
  test("adds to adoptedStyleSheets", () => {
    const sheet = createSharedSheet("p { color: green; }")
    const el = document.createElement("div")
    const sr = el.attachShadow({ mode: "open" })

    adoptUnoCSS({ shadowRoots: [sr], sheet })

    expect(sr.adoptedStyleSheets).toContain(sheet)
  })

  test("skips duplicate", () => {
    const sheet = createSharedSheet("p { color: green; }")
    const el = document.createElement("div")
    const sr = el.attachShadow({ mode: "open" })

    adoptUnoCSS({ shadowRoots: [sr], sheet })
    adoptUnoCSS({ shadowRoots: [sr], sheet })

    const count = sr.adoptedStyleSheets.filter((s) => s === sheet).length
    expect(count).toBe(1)
  })

  test("preserves existing sheets", () => {
    const existing = createSharedSheet("body { margin: 0; }")
    const newSheet = createSharedSheet("p { color: red; }")
    const el = document.createElement("div")
    const sr = el.attachShadow({ mode: "open" })
    sr.adoptedStyleSheets = [existing]

    adoptUnoCSS({ shadowRoots: [sr], sheet: newSheet })

    expect(sr.adoptedStyleSheets).toContain(existing)
    expect(sr.adoptedStyleSheets).toContain(newSheet)
  })
})

describe("css tag", () => {
  test("returns CSSResult with styleSheet getter", () => {
    const result = css`p { color: red; }`
    expect(result).toBeInstanceOf(CSSResult)
    expect(result.styleSheet).toBeInstanceOf(CSSStyleSheet)
  })

  test("handles interpolation", () => {
    const color = "blue"
    const result = css`p { color: ${color}; }`
    expect(result.styleSheet.cssRules.length).toBeGreaterThan(0)
  })
})
