import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, sqa, cleanup } from "../../utils/test-helpers"
import "./ui-toolbar"

describe("ui-toolbar", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders role=toolbar", async () => {
    el = await createElement("ui-toolbar")
    expect(sq(el, "[role='toolbar']")).not.toBeNull()
  })

  it("has horizontal orientation by default", async () => {
    el = await createElement("ui-toolbar")
    expect(sq(el, "[role='toolbar']")!.getAttribute("aria-orientation")).toBe("horizontal")
  })

  it("supports vertical orientation", async () => {
    el = await createElement("ui-toolbar", { orientation: "vertical" })
    expect(sq(el, "[role='toolbar']")!.getAttribute("aria-orientation")).toBe("vertical")
  })
})
