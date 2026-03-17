import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, sqa, cleanup } from "../../utils/test-helpers"
import "./ui-list-box"
import "./ui-list-box-item"
import "./ui-list-box-section"

describe("ui-list-box", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders role=listbox", async () => {
    el = await createElement("ui-list-box")
    expect(sq(el, "[role='listbox']")).not.toBeNull()
  })
})

describe("ui-list-box-item", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders role=option", async () => {
    el = await createElement("ui-list-box-item")
    expect(sq(el, "[role='option']")).not.toBeNull()
  })
})

describe("ui-list-box-section", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders group", async () => {
    el = await createElement("ui-list-box-section")
    expect(sq(el, "[role='group']")).not.toBeNull()
  })

  it("shows title", async () => {
    el = await createElement("ui-list-box-section", { title: "Options" })
    const title = sq(el, "div")
    expect(title!.textContent).toContain("Options")
  })
})
