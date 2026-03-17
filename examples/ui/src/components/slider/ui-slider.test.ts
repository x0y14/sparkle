import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, cleanup } from "../../utils/test-helpers"
import "./ui-slider"

describe("ui-slider", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders slider role", async () => {
    el = await createElement("ui-slider")
    expect(sq(el, "[role='slider']")).not.toBeNull()
  })

  it("reflects value in aria-valuenow", async () => {
    el = await createElement("ui-slider", { value: "50" })
    expect(sq(el, "[role='slider']")!.getAttribute("aria-valuenow")).toBe("50")
  })

  it("shows label", async () => {
    el = await createElement("ui-slider", { label: "Volume" })
    expect(sq(el, "[data-label]")!.textContent).toBe("Volume")
  })

  it("disabled state", async () => {
    el = await createElement("ui-slider", { "is-disabled": "" })
    expect(sq(el, "[data-container]")!.className).toContain("opacity-50")
  })
})
