import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, sqa, cleanup } from "../../utils/test-helpers"
import "./ui-color-area"

describe("ui-color-area", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders container", async () => {
    el = await createElement("ui-color-area")
    expect(sq(el, "div")).not.toBeNull()
  })

  it("has role slider", async () => {
    el = await createElement("ui-color-area")
    const slider = sq(el, "[role='slider']")
    expect(slider).not.toBeNull()
  })

  it("has thumb element", async () => {
    el = await createElement("ui-color-area")
    const divs = sqa(el, "div")
    expect(divs.length).toBeGreaterThanOrEqual(2)
  })
})
