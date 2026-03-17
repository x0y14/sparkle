import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, sqa, cleanup } from "../../utils/test-helpers"
import "./ui-modal"

describe("ui-modal", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders dialog", async () => {
    el = await createElement("ui-modal")
    expect(sq(el, "dialog")).not.toBeNull()
  })

  it("not visible by default", async () => {
    el = await createElement("ui-modal")
    const dialog = sq(el, "dialog") as HTMLElement
    expect(dialog.className).toContain("hidden")
  })

  it("visible when isOpen", async () => {
    el = await createElement("ui-modal", { "is-open": "" })
    const dialog = sq(el, "dialog") as HTMLElement
    expect(dialog.className).toContain("flex")
    expect(dialog.hasAttribute("open")).toBe(true)
  })

  it("size lg", async () => {
    el = await createElement("ui-modal", { "is-open": "", size: "lg" })
    const content = sq(el, "dialog > div:last-child") as HTMLElement
    expect(content.className).toContain("max-w-lg")
  })
})
