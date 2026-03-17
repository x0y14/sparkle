import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, cleanup } from "../../utils/test-helpers"
import "./ui-scroll-shadow"

describe("ui-scroll-shadow", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders container div", async () => {
    el = await createElement("ui-scroll-shadow")
    expect(sq(el, "div")).not.toBeNull()
  })

  it("has overflow-auto class", async () => {
    el = await createElement("ui-scroll-shadow")
    expect(sq(el, "div")!.className).toContain("overflow-auto")
  })
})
