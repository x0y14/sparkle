import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, cleanup } from "../../utils/test-helpers"
import "./ui-checkbox-group"

describe("ui-checkbox-group", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders fieldset", async () => {
    el = await createElement("ui-checkbox-group")
    expect(sq(el, "fieldset")).not.toBeNull()
  })

  it("shows legend when label provided", async () => {
    el = await createElement("ui-checkbox-group", { label: "Options" })
    expect(sq(el, "legend")!.textContent).toBe("Options")
  })

  it("vertical by default", async () => {
    el = await createElement("ui-checkbox-group")
    expect(sq(el, "fieldset")!.className).toContain("flex-col")
  })

  it("horizontal orientation", async () => {
    el = await createElement("ui-checkbox-group", { orientation: "horizontal" })
    expect(sq(el, "fieldset")!.className).toContain("flex-row")
  })
})
