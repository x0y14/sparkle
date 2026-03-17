import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, sqa, cleanup } from "../../utils/test-helpers"
import "./ui-disclosure"
import "./ui-disclosure-group"

describe("ui-disclosure", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders div element", async () => {
    el = await createElement("ui-disclosure")
    expect(sq(el, "div")).not.toBeNull()
  })

  it("shows title", async () => {
    el = await createElement("ui-disclosure", { title: "Details" })
    const btn = sq(el, "button")
    expect(btn).not.toBeNull()
    expect(btn!.textContent).toContain("Details")
  })
})

describe("ui-disclosure-group", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders div element", async () => {
    el = await createElement("ui-disclosure-group")
    expect(sq(el, "div")).not.toBeNull()
  })
})
