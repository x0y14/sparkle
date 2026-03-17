import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, sqa, cleanup } from "../../utils/test-helpers"
import "./ui-color-slider"

describe("ui-color-slider", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders", async () => {
    el = await createElement("ui-color-slider")
    expect(sq(el, "div")).not.toBeNull()
  })

  it("has role slider", async () => {
    el = await createElement("ui-color-slider")
    const slider = sq(el, "[role='slider']")
    expect(slider).not.toBeNull()
  })

  it("default channel hue with max 360", async () => {
    el = await createElement("ui-color-slider")
    const slider = sq(el, "[role='slider']")!
    expect(slider.getAttribute("aria-valuemax")).toBe("360")
  })

  it("channel brightness with max 100", async () => {
    el = await createElement("ui-color-slider", { channel: "brightness" })
    const slider = sq(el, "[role='slider']")!
    expect(slider.getAttribute("aria-valuemax")).toBe("100")
  })
})
