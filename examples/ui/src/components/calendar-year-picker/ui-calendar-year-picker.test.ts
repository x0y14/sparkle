import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, sqa, cleanup } from "../../utils/test-helpers"
import "./ui-calendar-year-picker"

describe("ui-calendar-year-picker", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders container", async () => {
    el = await createElement("ui-calendar-year-picker")
    expect(sq(el, "div")).not.toBeNull()
  })

  it("has year buttons", async () => {
    el = await createElement("ui-calendar-year-picker")
    const years = sqa(el, "[data-year]")
    expect(years.length).toBeGreaterThan(0)
  })

  it("has grid", async () => {
    el = await createElement("ui-calendar-year-picker")
    expect(sq(el, "[role='grid']")).not.toBeNull()
  })
})
