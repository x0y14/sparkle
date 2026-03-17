import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, cleanup } from "../../utils/test-helpers"
import "./ui-checkbox"

describe("ui-checkbox", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders label element", async () => {
    el = await createElement("ui-checkbox")
    expect(sq(el, "label")).not.toBeNull()
  })

  it("not selected by default", async () => {
    el = await createElement("ui-checkbox")
    expect(sq(el, "[data-check] svg")).toBeNull()
  })

  it("selected shows check icon", async () => {
    el = await createElement("ui-checkbox", { "is-selected": "" })
    expect(sq(el, "[data-check] svg")).not.toBeNull()
  })

  it("disabled state", async () => {
    el = await createElement("ui-checkbox", { "is-disabled": "" })
    expect(sq(el, "label")!.className).toContain("opacity-50")
  })

  it("color primary when selected", async () => {
    el = await createElement("ui-checkbox", { "is-selected": "", color: "primary" })
    expect(sq(el, "[data-check]")!.className).toContain("bg-primary")
  })
})
