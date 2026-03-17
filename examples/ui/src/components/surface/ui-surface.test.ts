import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, cleanup } from "../../utils/test-helpers"
import "./ui-surface"

describe("ui-surface", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders div", async () => {
    el = await createElement("ui-surface")
    expect(sq(el, "div")).not.toBeNull()
  })

  it("default variant", async () => {
    el = await createElement("ui-surface")
    expect(sq(el, "div")!.className).toContain("bg-background")
  })

  it("secondary variant", async () => {
    el = await createElement("ui-surface", { variant: "secondary" })
    expect(sq(el, "div")!.className).toContain("bg-content2")
  })

  it("tertiary variant", async () => {
    el = await createElement("ui-surface", { variant: "tertiary" })
    expect(sq(el, "div")!.className).toContain("bg-content3")
  })
})
