import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, sqa, cleanup } from "../../utils/test-helpers"
import "./ui-tooltip"

describe("ui-tooltip", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders", async () => {
    el = await createElement("ui-tooltip", { content: "Hello" })
    expect(sq(el, "div")).not.toBeNull()
  })

  it("tooltip div exists in shadow DOM", async () => {
    el = await createElement("ui-tooltip", { content: "Tip text" })
    const tooltip = sq(el, "[data-tooltip]")
    expect(tooltip).not.toBeNull()
    expect(tooltip!.textContent!.trim()).toBe("Tip text")
  })

  it("has role tooltip", async () => {
    el = await createElement("ui-tooltip", { content: "Tip" })
    const tooltip = sq(el, "[role='tooltip']")
    expect(tooltip).not.toBeNull()
  })

  it("tooltip hidden by default", async () => {
    el = await createElement("ui-tooltip", { content: "Tip" })
    const tooltip = sq(el, "[data-tooltip]") as HTMLElement
    expect(tooltip.className).toContain("invisible")
  })
})
