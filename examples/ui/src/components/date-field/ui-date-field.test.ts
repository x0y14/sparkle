import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, sqa, cleanup } from "../../utils/test-helpers"
import "./ui-date-field"

describe("ui-date-field", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders", async () => {
    el = await createElement("ui-date-field")
    expect(sq(el, "div")).not.toBeNull()
  })

  it("has multiple input segments", async () => {
    el = await createElement("ui-date-field")
    const inputs = sqa(el, "input")
    expect(inputs.length).toBe(3)
  })

  it("has year segment", async () => {
    el = await createElement("ui-date-field")
    expect(sq(el, "[data-segment='year']")).not.toBeNull()
  })

  it("has month segment", async () => {
    el = await createElement("ui-date-field")
    expect(sq(el, "[data-segment='month']")).not.toBeNull()
  })

  it("has day segment", async () => {
    el = await createElement("ui-date-field")
    expect(sq(el, "[data-segment='day']")).not.toBeNull()
  })
})
