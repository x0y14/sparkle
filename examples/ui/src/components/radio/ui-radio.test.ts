import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, cleanup } from "../../utils/test-helpers"
import "./ui-radio"

describe("ui-radio", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders label", async () => {
    el = await createElement("ui-radio")
    expect(sq(el, "label")).not.toBeNull()
  })

  it("has rounded-full for radio circle", async () => {
    el = await createElement("ui-radio")
    expect(sq(el, "[data-radio]")!.className).toContain("rounded-full")
  })

  it("disabled state", async () => {
    el = await createElement("ui-radio", { "is-disabled": "" })
    expect(sq(el, "label")!.className).toContain("opacity-50")
  })
})
