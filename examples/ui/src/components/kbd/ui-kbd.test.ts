import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, cleanup } from "../../utils/test-helpers"
import "./ui-kbd"

describe("ui-kbd", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders kbd element", async () => {
    el = await createElement("ui-kbd")
    expect(sq(el, "kbd")).not.toBeNull()
  })

  it("has expected classes", async () => {
    el = await createElement("ui-kbd")
    const kbd = sq(el, "kbd")
    expect(kbd!.className).toContain("font-mono")
    expect(kbd!.className).toContain("bg-default-100")
  })
})
