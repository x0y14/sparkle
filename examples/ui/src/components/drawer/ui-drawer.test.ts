import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, sqa, cleanup } from "../../utils/test-helpers"
import "./ui-drawer"

describe("ui-drawer", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders dialog", async () => {
    el = await createElement("ui-drawer")
    expect(sq(el, "dialog")).not.toBeNull()
  })

  it("not visible by default", async () => {
    el = await createElement("ui-drawer")
    const dialog = sq(el, "dialog") as HTMLElement
    expect(dialog.className).toContain("hidden")
  })

  it("visible when isOpen", async () => {
    el = await createElement("ui-drawer", { "is-open": "" })
    const dialog = sq(el, "dialog") as HTMLElement
    expect(dialog.className).toContain("flex")
    expect(dialog.hasAttribute("open")).toBe(true)
  })

  it("default placement right", async () => {
    el = await createElement("ui-drawer", { "is-open": "" })
    const panel = sq(el, "dialog > div:last-child") as HTMLElement
    expect(panel.className).toContain("right-0")
  })
})
