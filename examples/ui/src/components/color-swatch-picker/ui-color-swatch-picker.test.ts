import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, sqa, cleanup } from "../../utils/test-helpers"
import "./ui-color-swatch-picker"

describe("ui-color-swatch-picker", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders container", async () => {
    el = await createElement("ui-color-swatch-picker")
    const div = sq(el, "div")
    expect(div).not.toBeNull()
    expect(div!.className).toContain("flex")
    expect(div!.className).toContain("flex-wrap")
    expect(div!.className).toContain("gap-2")
  })

  it("has slot for children", async () => {
    el = await createElement("ui-color-swatch-picker")
    expect(sq(el, "slot")).not.toBeNull()
  })
})
