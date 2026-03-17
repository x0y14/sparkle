import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, cleanup } from "../../utils/test-helpers"
import "./ui-input-group"

describe("ui-input-group", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders container div", async () => {
    el = await createElement("ui-input-group")
    expect(sq(el, "div")).not.toBeNull()
  })

  it("has prefix slot", async () => {
    el = await createElement("ui-input-group")
    const slots = el.shadowRoot!.querySelectorAll("slot[name='prefix']")
    expect(slots.length).toBe(1)
  })
})
