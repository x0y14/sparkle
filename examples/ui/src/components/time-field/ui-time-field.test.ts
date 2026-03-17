import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, sqa, cleanup } from "../../utils/test-helpers"
import "./ui-time-field"

describe("ui-time-field", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders", async () => {
    el = await createElement("ui-time-field")
    expect(sq(el, "div")).not.toBeNull()
  })

  it("has input segments", async () => {
    el = await createElement("ui-time-field")
    const inputs = sqa(el, "input")
    expect(inputs.length).toBe(2)
  })

  it("has hour segment", async () => {
    el = await createElement("ui-time-field")
    expect(sq(el, "[data-segment='hour']")).not.toBeNull()
  })

  it("has minute segment", async () => {
    el = await createElement("ui-time-field")
    expect(sq(el, "[data-segment='minute']")).not.toBeNull()
  })
})
