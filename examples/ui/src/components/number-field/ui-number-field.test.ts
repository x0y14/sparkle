import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, cleanup } from "../../utils/test-helpers"
import "./ui-number-field"

describe("ui-number-field", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders input", async () => {
    el = await createElement("ui-number-field")
    expect(sq(el, "input")).not.toBeNull()
  })

  it("renders increment/decrement buttons", async () => {
    el = await createElement("ui-number-field")
    const btns = el.shadowRoot!.querySelectorAll("button")
    expect(btns.length).toBe(2)
  })

  it("disabled state", async () => {
    el = await createElement("ui-number-field", { "is-disabled": "" })
    expect((sq(el, "input") as HTMLInputElement).disabled).toBe(true)
  })
})
