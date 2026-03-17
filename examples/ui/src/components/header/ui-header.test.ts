import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, cleanup } from "../../utils/test-helpers"
import "./ui-header"

describe("ui-header", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders h3 by default", async () => {
    el = await createElement("ui-header")
    expect(sq(el, "h3")).not.toBeNull()
  })

  it("renders h1 when level=1", async () => {
    el = await createElement("ui-header", { level: "1" })
    expect(sq(el, "h1")).not.toBeNull()
  })

  it("renders h6 when level=6", async () => {
    el = await createElement("ui-header", { level: "6" })
    expect(sq(el, "h6")).not.toBeNull()
  })
})
