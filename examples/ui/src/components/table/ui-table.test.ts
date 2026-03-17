import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, cleanup } from "../../utils/test-helpers"
import "./ui-table"

describe("ui-table", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders container div", async () => {
    el = await createElement("ui-table")
    expect(sq(el, "div")).not.toBeNull()
  })

  it("has overflow-auto class", async () => {
    el = await createElement("ui-table")
    expect(sq(el, "div")!.className).toContain("overflow-auto")
  })

  it("has role table", async () => {
    el = await createElement("ui-table")
    expect(sq(el, "div")!.getAttribute("role")).toBe("table")
  })

  it("aria-label", async () => {
    el = await createElement("ui-table", { "aria-label": "Users" })
    expect(sq(el, "div")!.getAttribute("aria-label")).toBe("Users")
  })
})
