import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, sqa, cleanup } from "../../utils/test-helpers"
import "./ui-tag-group"

describe("ui-tag-group", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders div element", async () => {
    el = await createElement("ui-tag-group")
    expect(sq(el, "div")).not.toBeNull()
  })

  it("shows label", async () => {
    el = await createElement("ui-tag-group", { label: "Tags" })
    const span = sq(el, "span")
    expect(span).not.toBeNull()
    expect(span!.textContent).toContain("Tags")
  })
})
