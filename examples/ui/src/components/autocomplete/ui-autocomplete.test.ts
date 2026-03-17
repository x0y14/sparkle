import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, cleanup } from "../../utils/test-helpers"
import "./ui-autocomplete"

describe("ui-autocomplete", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders input", async () => {
    el = await createElement("ui-autocomplete")
    expect(sq(el, "input")).not.toBeNull()
  })

  it("has placeholder", async () => {
    el = await createElement("ui-autocomplete", { placeholder: "Search..." })
    expect((sq(el, "input") as HTMLInputElement).placeholder).toBe("Search...")
  })

  it("disabled state", async () => {
    el = await createElement("ui-autocomplete", { "is-disabled": "" })
    expect((sq(el, "input") as HTMLInputElement).disabled).toBe(true)
  })

  it("has combobox role", async () => {
    el = await createElement("ui-autocomplete")
    expect(sq(el, "input")!.getAttribute("role")).toBe("combobox")
  })
})
