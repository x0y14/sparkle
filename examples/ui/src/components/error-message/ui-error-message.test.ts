import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, cleanup } from "../../utils/test-helpers"
import "./ui-error-message"

describe("ui-error-message", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders p with role=alert", async () => {
    el = await createElement("ui-error-message")
    expect(sq(el, "[role='alert']")).not.toBeNull()
  })

  it("has text-danger class", async () => {
    el = await createElement("ui-error-message")
    expect(sq(el, "p")!.className).toContain("text-danger")
  })
})
