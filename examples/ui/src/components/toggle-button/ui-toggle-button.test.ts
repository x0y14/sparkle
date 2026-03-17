import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, cleanup } from "../../utils/test-helpers"
import "./ui-toggle-button"

describe("ui-toggle-button", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders button", async () => {
    el = await createElement("ui-toggle-button")
    expect(sq(el, "button")).not.toBeNull()
  })

  it("has aria-pressed=false by default", async () => {
    el = await createElement("ui-toggle-button")
    expect(sq(el, "button")!.getAttribute("aria-pressed")).toBe("false")
  })

  it("has aria-pressed=true when selected", async () => {
    el = await createElement("ui-toggle-button", { "is-selected": "" })
    expect(sq(el, "button")!.getAttribute("aria-pressed")).toBe("true")
  })

  it("disabled state", async () => {
    el = await createElement("ui-toggle-button", { "is-disabled": "" })
    expect((sq(el, "button") as HTMLButtonElement).disabled).toBe(true)
  })
})
