import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, cleanup } from "../../utils/test-helpers"
import "./ui-button-group"

describe("ui-button-group", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders div with role=group", async () => {
    el = await createElement("ui-button-group")
    expect(sq(el, "[role='group']")).not.toBeNull()
  })

  it("has inline-flex class", async () => {
    el = await createElement("ui-button-group")
    expect(sq(el, "div")!.className).toContain("inline-flex")
  })
})
