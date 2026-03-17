import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, cleanup } from "../../utils/test-helpers"
import "./ui-search-field"

describe("ui-search-field", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders input", async () => {
    el = await createElement("ui-search-field")
    expect(sq(el, "input")).not.toBeNull()
  })

  it("has search icon", async () => {
    el = await createElement("ui-search-field")
    expect(sq(el, "svg")).not.toBeNull()
  })

  it("disabled state", async () => {
    el = await createElement("ui-search-field", { "is-disabled": "" })
    expect((sq(el, "input") as HTMLInputElement).disabled).toBe(true)
  })
})
