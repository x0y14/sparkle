import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, cleanup } from "../../utils/test-helpers"
import "./ui-combo-box"

describe("ui-combo-box", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders input", async () => {
    el = await createElement("ui-combo-box")
    expect(sq(el, "input")).not.toBeNull()
  })

  it("has placeholder", async () => {
    el = await createElement("ui-combo-box", { placeholder: "Select..." })
    expect((sq(el, "input") as HTMLInputElement).placeholder).toBe("Select...")
  })

  it("disabled state", async () => {
    el = await createElement("ui-combo-box", { "is-disabled": "" })
    expect((sq(el, "input") as HTMLInputElement).disabled).toBe(true)
  })

  it("has combobox role", async () => {
    el = await createElement("ui-combo-box")
    expect(sq(el, "input")!.getAttribute("role")).toBe("combobox")
  })
})
