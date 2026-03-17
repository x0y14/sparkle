import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, cleanup } from "../../utils/test-helpers"
import "./ui-select"

describe("ui-select", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders trigger button", async () => {
    el = await createElement("ui-select")
    expect(sq(el, "button")).not.toBeNull()
  })

  it("shows placeholder text", async () => {
    el = await createElement("ui-select", { placeholder: "Pick one" })
    expect(sq(el, "button")!.textContent).toContain("Pick one")
  })

  it("disabled state", async () => {
    el = await createElement("ui-select", { "is-disabled": "" })
    expect((sq(el, "button") as HTMLButtonElement).disabled).toBe(true)
  })
})
