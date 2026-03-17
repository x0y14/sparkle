import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, sqa, cleanup } from "../../utils/test-helpers"
import "./ui-popover"

describe("ui-popover", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders", async () => {
    el = await createElement("ui-popover")
    expect(sq(el, "div")).not.toBeNull()
  })

  it("has trigger area", async () => {
    el = await createElement("ui-popover")
    const trigger = sq(el, "[data-trigger]")
    expect(trigger).not.toBeNull()
  })

  it("popover hidden by default", async () => {
    el = await createElement("ui-popover")
    const popover = sq(el, "div > div:last-child") as HTMLElement
    expect(popover.className).toContain("hidden")
  })

  it("popover visible when isOpen", async () => {
    el = await createElement("ui-popover", { "is-open": "" })
    const popover = sq(el, "div > div:last-child") as HTMLElement
    expect(popover.className).toContain("block")
  })
})
