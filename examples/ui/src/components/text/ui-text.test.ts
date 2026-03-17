import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, cleanup } from "../../utils/test-helpers"
import "./ui-text"

describe("ui-text", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders p element", async () => {
    el = await createElement("ui-text")
    expect(sq(el, "p")).not.toBeNull()
  })

  it("default size md", async () => {
    el = await createElement("ui-text")
    expect(sq(el, "p")!.className).toContain("text-sm")
  })

  it("size sm", async () => {
    el = await createElement("ui-text", { size: "sm" })
    expect(sq(el, "p")!.className).toContain("text-xs")
  })

  it("size lg", async () => {
    el = await createElement("ui-text", { size: "lg" })
    expect(sq(el, "p")!.className).toContain("text-base")
  })
})
