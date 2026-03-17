import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, cleanup } from "../../utils/test-helpers"
import "./ui-date-picker"

describe("ui-date-picker", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders", async () => {
    el = await createElement("ui-date-picker")
    expect(sq(el, "div")).not.toBeNull()
  })

  it("has trigger button", async () => {
    el = await createElement("ui-date-picker")
    expect(sq(el, "[data-trigger]")).not.toBeNull()
  })

  it("shows label", async () => {
    el = await createElement("ui-date-picker", { label: "Date" })
    expect(sq(el, "label")).not.toBeNull()
    expect(sq(el, "label")!.textContent).toBe("Date")
  })
})
