import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, cleanup } from "../../utils/test-helpers"
import "./ui-empty-state"

describe("ui-empty-state", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders container div", async () => {
    el = await createElement("ui-empty-state")
    expect(sq(el, "div")).not.toBeNull()
  })

  it("shows title", async () => {
    el = await createElement("ui-empty-state", { title: "No items" })
    expect(sq(el, "h3")!.textContent).toBe("No items")
  })

  it("shows description", async () => {
    el = await createElement("ui-empty-state", { description: "Try adding some" })
    expect(sq(el, "p")!.textContent).toBe("Try adding some")
  })
})
