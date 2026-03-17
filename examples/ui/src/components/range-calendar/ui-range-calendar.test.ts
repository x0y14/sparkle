import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, sqa, cleanup } from "../../utils/test-helpers"
import "./ui-range-calendar"

describe("ui-range-calendar", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders container", async () => {
    el = await createElement("ui-range-calendar")
    expect(sq(el, "div")).not.toBeNull()
  })

  it("has grid", async () => {
    el = await createElement("ui-range-calendar")
    expect(sq(el, "[role='grid']")).not.toBeNull()
  })

  it("has navigation buttons", async () => {
    el = await createElement("ui-range-calendar")
    expect(sq(el, "[data-prev]")).not.toBeNull()
    expect(sq(el, "[data-next]")).not.toBeNull()
  })

  it("has day cells", async () => {
    el = await createElement("ui-range-calendar")
    const days = sqa(el, "[data-day]")
    expect(days.length).toBeGreaterThan(0)
  })
})
