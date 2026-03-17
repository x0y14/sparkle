import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, sqa, cleanup } from "../../utils/test-helpers"
import "./ui-tabs"
import "./ui-tab"

describe("ui-tabs", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders tablist", async () => {
    el = await createElement("ui-tabs")
    expect(sq(el, "[role='tablist']")).not.toBeNull()
  })
})

describe("ui-tab", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders container", async () => {
    el = await createElement("ui-tab")
    expect(sq(el, "div")).not.toBeNull()
  })
})
