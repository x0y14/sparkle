import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, cleanup } from "../../utils/test-helpers"
import "./ui-textarea"

describe("ui-textarea", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders textarea element", async () => {
    el = await createElement("ui-textarea")
    expect(sq(el, "textarea")).not.toBeNull()
  })

  it("default rows=3", async () => {
    el = await createElement("ui-textarea")
    expect(sq(el, "textarea")!.getAttribute("rows")).toBe("3")
  })

  it("disabled", async () => {
    el = await createElement("ui-textarea", { "is-disabled": "" })
    expect((sq(el, "textarea") as HTMLTextAreaElement).disabled).toBe(true)
  })
})
