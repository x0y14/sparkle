import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, cleanup } from "../../utils/test-helpers"
import "./ui-label"

describe("ui-label", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders label element", async () => {
    el = await createElement("ui-label")
    expect(sq(el, "label")).not.toBeNull()
  })

  it("has text-sm class", async () => {
    el = await createElement("ui-label")
    expect(sq(el, "label")!.className).toContain("text-sm")
  })
})
