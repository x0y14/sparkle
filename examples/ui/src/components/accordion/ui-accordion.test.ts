import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, sqa, cleanup } from "../../utils/test-helpers"
import "./ui-accordion"
import "./ui-accordion-item"

describe("ui-accordion", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders div element", async () => {
    el = await createElement("ui-accordion")
    expect(sq(el, "div")).not.toBeNull()
  })
})

describe("ui-accordion-item", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders div element", async () => {
    el = await createElement("ui-accordion-item")
    expect(sq(el, "div")).not.toBeNull()
  })

  it("shows title", async () => {
    el = await createElement("ui-accordion-item", { title: "Hello" })
    const btn = sq(el, "button")
    expect(btn).not.toBeNull()
    expect(btn!.textContent).toContain("Hello")
  })

  it("has button element", async () => {
    el = await createElement("ui-accordion-item", { title: "Title" })
    expect(sq(el, "button")).not.toBeNull()
  })
})
