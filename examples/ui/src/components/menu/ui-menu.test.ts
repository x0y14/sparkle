import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, sqa, cleanup } from "../../utils/test-helpers"
import "./ui-menu"
import "./ui-menu-item"
import "./ui-menu-section"

describe("ui-menu", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders role=menu", async () => {
    el = await createElement("ui-menu")
    expect(sq(el, "[role='menu']")).not.toBeNull()
  })
})

describe("ui-menu-item", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders role=menuitem", async () => {
    el = await createElement("ui-menu-item")
    expect(sq(el, "[role='menuitem']")).not.toBeNull()
  })
})

describe("ui-menu-section", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders group", async () => {
    el = await createElement("ui-menu-section")
    expect(sq(el, "[role='group']")).not.toBeNull()
  })

  it("shows title", async () => {
    el = await createElement("ui-menu-section", { title: "Actions" })
    const title = sq(el, "div")
    expect(title!.textContent).toContain("Actions")
  })
})
