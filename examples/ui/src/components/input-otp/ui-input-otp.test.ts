import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, sqa, cleanup } from "../../utils/test-helpers"
import "./ui-input-otp"

describe("ui-input-otp", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders 6 input fields by default", async () => {
    el = await createElement("ui-input-otp")
    expect(sqa(el, "input").length).toBe(6)
  })

  it("renders custom length", async () => {
    el = await createElement("ui-input-otp", { length: "4" })
    expect(sqa(el, "input").length).toBe(4)
  })

  it("disabled state", async () => {
    el = await createElement("ui-input-otp", { "is-disabled": "" })
    const inputs = sqa(el, "input") as HTMLInputElement[]
    expect(inputs.every(i => i.disabled)).toBe(true)
  })
})
