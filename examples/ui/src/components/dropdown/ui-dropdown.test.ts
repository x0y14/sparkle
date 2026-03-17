import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, sqa, cleanup } from "../../utils/test-helpers"
import "./ui-dropdown"
import "./ui-dropdown-menu"
import "./ui-dropdown-item"

describe("ui-dropdown", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders div element", async () => {
    el = await createElement("ui-dropdown")
    expect(sq(el, "div")).not.toBeNull()
  })
})

describe("ui-dropdown-menu", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders menu div", async () => {
    el = await createElement("ui-dropdown-menu")
    expect(sq(el, "[role='menu']")).not.toBeNull()
  })
})

describe("ui-dropdown-item", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders menuitem", async () => {
    el = await createElement("ui-dropdown-item")
    expect(sq(el, "[role='menuitem']")).not.toBeNull()
  })

  it("shows text via slot", async () => {
    el = await createElement("ui-dropdown-item", { key: "edit" })
    expect(sq(el, "[role='menuitem']")).not.toBeNull()
  })
})
