import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, cleanup } from "../src/utils/test-helpers"
import "../src/components/layout-editor"

describe("layout-editor", () => {
  let el: HTMLElement
  afterEach(() => {
    if (el) cleanup(el)
  })

  it("renders textarea element", async () => {
    el = await createElement("layout-editor")
    expect(sq(el, "textarea")).not.toBeNull()
  })

  it("shows default placeholder", async () => {
    el = await createElement("layout-editor")
    expect(sq(el, "textarea")!.getAttribute("placeholder")).toBe(
      "Enter layout JSON here...",
    )
  })

  it("accepts custom placeholder", async () => {
    el = await createElement("layout-editor", { placeholder: "Type JSON" })
    expect(sq(el, "textarea")!.getAttribute("placeholder")).toBe("Type JSON")
  })

  it("reflects value prop", async () => {
    el = await createElement("layout-editor", {
      value: '{"type":"item","id":"a"}',
    })
    const ta = sq(el, "textarea") as HTMLTextAreaElement
    expect(ta.textContent).toContain('{"type":"item","id":"a"}')
  })

  it("emits input event on typing", async () => {
    el = await createElement("layout-editor")
    let received: string | undefined
    el.addEventListener(
      "input",
      ((e: CustomEvent) => {
        received = e.detail.value
      }) as EventListener,
    )
    const ta = sq(el, "textarea") as HTMLTextAreaElement
    ta.value = '{"type":"item","id":"test"}'
    ta.dispatchEvent(new Event("input", { bubbles: true }))
    await new Promise((r) => setTimeout(r, 0))
    expect(received).toBe('{"type":"item","id":"test"}')
  })
})
