import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, sqa, cleanup } from "../../utils/test-helpers"
import "./ui-form"

describe("ui-form", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders form element", async () => {
    el = await createElement("ui-form")
    expect(sq(el, "form")).not.toBeNull()
  })
})
