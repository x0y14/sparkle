import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, cleanup } from "../../utils/test-helpers"
import "./ui-date-input-group"

describe("ui-date-input-group", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders container", async () => {
    el = await createElement("ui-date-input-group")
    expect(sq(el, "div")).not.toBeNull()
  })

  it("has prefix slot", async () => {
    el = await createElement("ui-date-input-group")
    const slots = el.shadowRoot!.querySelectorAll("slot[name='prefix']")
    expect(slots.length).toBe(1)
  })

  it("has suffix slot", async () => {
    el = await createElement("ui-date-input-group")
    const slots = el.shadowRoot!.querySelectorAll("slot[name='suffix']")
    expect(slots.length).toBe(1)
  })
})
