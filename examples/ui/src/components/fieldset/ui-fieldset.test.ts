import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, sqa, cleanup } from "../../utils/test-helpers"
import "./ui-fieldset"

describe("ui-fieldset", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders fieldset element", async () => {
    el = await createElement("ui-fieldset")
    expect(sq(el, "fieldset")).not.toBeNull()
  })

  it("shows legend", async () => {
    el = await createElement("ui-fieldset", { legend: "Personal Info" })
    const legend = sq(el, "legend")
    expect(legend).not.toBeNull()
    expect(legend!.textContent).toContain("Personal Info")
  })

  it("disabled state", async () => {
    el = await createElement("ui-fieldset", { "is-disabled": "" })
    const fieldset = sq(el, "fieldset") as HTMLFieldSetElement
    expect(fieldset.disabled).toBe(true)
  })
})
