import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, cleanup } from "../../utils/test-helpers"
import "./ui-date-range-picker"

describe("ui-date-range-picker", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders container", async () => {
    el = await createElement("ui-date-range-picker")
    expect(sq(el, "div")).not.toBeNull()
  })

  it("has trigger button", async () => {
    el = await createElement("ui-date-range-picker")
    expect(sq(el, "[data-trigger]")).not.toBeNull()
  })

  it("shows placeholder text", async () => {
    el = await createElement("ui-date-range-picker")
    const spans = el.shadowRoot!.querySelectorAll("span")
    expect(spans.length).toBeGreaterThan(0)
  })
})
