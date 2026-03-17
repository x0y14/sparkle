import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, cleanup } from "../../utils/test-helpers"
import "./ui-switch-group"

describe("ui-switch-group", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders fieldset", async () => {
    el = await createElement("ui-switch-group")
    expect(sq(el, "fieldset")).not.toBeNull()
  })
})
