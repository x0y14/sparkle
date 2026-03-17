import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, sqa, cleanup } from "../../utils/test-helpers"
import "./ui-color-picker"

describe("ui-color-picker", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders button", async () => {
    el = await createElement("ui-color-picker")
    expect(sq(el, "button")).not.toBeNull()
  })

  it("has trigger button", async () => {
    el = await createElement("ui-color-picker")
    const btn = sq(el, "[data-trigger]")
    expect(btn).not.toBeNull()
  })

  it("popover hidden by default", async () => {
    el = await createElement("ui-color-picker")
    const popover = sq(el, "div > div:last-child") as HTMLElement
    expect(popover.className).toContain("hidden")
  })
})
