import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, cleanup } from "../../utils/test-helpers"
import "./ui-radio-group"

describe("ui-radio-group", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders fieldset", async () => {
    el = await createElement("ui-radio-group")
    expect(sq(el, "fieldset")).not.toBeNull()
  })

  it("shows legend", async () => {
    el = await createElement("ui-radio-group", { label: "Size" })
    expect(sq(el, "legend")!.textContent).toBe("Size")
  })
})
