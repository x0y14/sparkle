import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, sqa, cleanup } from "../../utils/test-helpers"
import "./ui-color-swatch"

describe("ui-color-swatch", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders div", async () => {
    el = await createElement("ui-color-swatch")
    expect(sq(el, "div")).not.toBeNull()
  })

  it("has background-color style", async () => {
    el = await createElement("ui-color-swatch", { color: "#ff0000" })
    const div = sq(el, "div") as HTMLElement
    expect(div.style.backgroundColor).toMatch(/(rgb\(255, 0, 0\)|#ff0000)/)
  })

  it("has role img", async () => {
    el = await createElement("ui-color-swatch")
    const div = sq(el, "div")!
    expect(div.getAttribute("role")).toBe("img")
  })

  it("has aria-label matching color", async () => {
    el = await createElement("ui-color-swatch", { color: "#00ff00" })
    const div = sq(el, "div")!
    expect(div.getAttribute("aria-label")).toBe("#00ff00")
  })

  it("size sm", async () => {
    el = await createElement("ui-color-swatch", { size: "sm" })
    const cls = sq(el, "div")!.className
    expect(cls).toContain("w-6")
    expect(cls).toContain("h-6")
  })

  it("size lg", async () => {
    el = await createElement("ui-color-swatch", { size: "lg" })
    const cls = sq(el, "div")!.className
    expect(cls).toContain("w-10")
    expect(cls).toContain("h-10")
  })
})
