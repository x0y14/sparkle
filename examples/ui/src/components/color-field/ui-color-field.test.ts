import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, sqa, cleanup } from "../../utils/test-helpers"
import "./ui-color-field"

describe("ui-color-field", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders input", async () => {
    el = await createElement("ui-color-field")
    expect(sq(el, "input")).not.toBeNull()
  })

  it("input has type text", async () => {
    el = await createElement("ui-color-field")
    const input = sq(el, "input") as HTMLInputElement
    expect(input.type).toBe("text")
  })

  it("shows value", async () => {
    el = await createElement("ui-color-field", { value: "#ff0000" })
    const input = sq(el, "input") as HTMLInputElement
    expect(input.value).toBe("#ff0000")
  })

  it("shows label when provided", async () => {
    el = await createElement("ui-color-field", { label: "Hex Color" })
    const label = sq(el, "label")
    expect(label).not.toBeNull()
    expect(label!.textContent!.trim()).toBe("Hex Color")
  })
})
