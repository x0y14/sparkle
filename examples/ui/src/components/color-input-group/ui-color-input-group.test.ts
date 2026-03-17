import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, sqa, cleanup } from "../../utils/test-helpers"
import "./ui-color-input-group"

describe("ui-color-input-group", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders div", async () => {
    el = await createElement("ui-color-input-group")
    const div = sq(el, "div")
    expect(div).not.toBeNull()
  })

  it("has flex layout", async () => {
    el = await createElement("ui-color-input-group")
    const div = sq(el, "div")!
    expect(div.className).toContain("flex")
    expect(div.className).toContain("items-center")
  })

  it("has prefix and suffix slots", async () => {
    el = await createElement("ui-color-input-group")
    const slots = sqa(el, "slot")
    expect(slots.length).toBe(3)
  })
})
