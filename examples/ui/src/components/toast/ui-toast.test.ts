import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, sqa, cleanup } from "../../utils/test-helpers"
import "./ui-toast"

describe("ui-toast", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders", async () => {
    el = await createElement("ui-toast")
    expect(sq(el, "div")).not.toBeNull()
  })

  it("shows title", async () => {
    el = await createElement("ui-toast", { title: "Success" })
    const titleDiv = sq(el, ".font-semibold")
    expect(titleDiv).not.toBeNull()
    expect(titleDiv!.textContent!.trim()).toBe("Success")
  })

  it("shows description", async () => {
    el = await createElement("ui-toast", { description: "Operation completed" })
    const descDiv = sq(el, ".opacity-80")
    expect(descDiv).not.toBeNull()
    expect(descDiv!.textContent!.trim()).toBe("Operation completed")
  })

  it("has role alert", async () => {
    el = await createElement("ui-toast")
    const container = sq(el, "[role='alert']")
    expect(container).not.toBeNull()
  })
})
