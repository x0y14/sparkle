import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, sqa, cleanup } from "../../utils/test-helpers"
import "./ui-pagination"

describe("ui-pagination", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders nav element", async () => {
    el = await createElement("ui-pagination")
    expect(sq(el, "nav")).not.toBeNull()
  })

  it("has prev and next buttons", async () => {
    el = await createElement("ui-pagination", { total: "5", page: "1" })
    const prev = sq(el, "button[aria-label='Previous']")
    const next = sq(el, "button[aria-label='Next']")
    expect(prev).not.toBeNull()
    expect(next).not.toBeNull()
  })

  it("renders page number buttons", async () => {
    el = await createElement("ui-pagination", { total: "3", page: "1" })
    const buttons = sqa(el, "button[data-page]")
    expect(buttons.length).toBeGreaterThanOrEqual(3)
  })

  it("disables when is-disabled", async () => {
    el = await createElement("ui-pagination", { total: "3", page: "1", "is-disabled": "" })
    const nav = sq(el, "nav")
    expect(nav!.className).toContain("opacity-50")
  })
})
