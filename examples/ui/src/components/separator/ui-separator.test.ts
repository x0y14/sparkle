import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, cleanup } from "../../utils/test-helpers"
import "./ui-separator"

describe("ui-separator", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders hr in shadow DOM", async () => {
    el = await createElement("ui-separator")
    const hr = sq(el, "hr")
    expect(hr).not.toBeNull()
    expect(hr!.tagName).toBe("HR")
  })

  it("horizontal by default", async () => {
    el = await createElement("ui-separator")
    const hr = sq(el, "hr")
    expect(hr!.getAttribute("aria-orientation")).toBe("horizontal")
    expect(hr!.className).toContain("h-px")
  })

  it("vertical orientation", async () => {
    el = await createElement("ui-separator", { orientation: "vertical" })
    const hr = sq(el, "hr")
    expect(hr!.getAttribute("aria-orientation")).toBe("vertical")
    expect(hr!.className).toContain("w-px")
  })
})
