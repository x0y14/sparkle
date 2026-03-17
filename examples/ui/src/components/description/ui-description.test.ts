import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, cleanup } from "../../utils/test-helpers"
import "./ui-description"

describe("ui-description", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders p element", async () => {
    el = await createElement("ui-description")
    expect(sq(el, "p")).not.toBeNull()
  })

  it("has text-default-400 class", async () => {
    el = await createElement("ui-description")
    expect(sq(el, "p")!.className).toContain("text-default-400")
  })
})
