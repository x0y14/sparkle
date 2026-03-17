import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, cleanup } from "../../utils/test-helpers"
import "./ui-toggle-button-group"

describe("ui-toggle-button-group", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders div with role=group", async () => {
    el = await createElement("ui-toggle-button-group")
    expect(sq(el, "[role='group']")).not.toBeNull()
  })
})
