import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, cleanup } from "../src/utils/test-helpers"
import "../src/components/md-editor"

describe("md-editor", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders textarea element", async () => {
    el = await createElement("md-editor")
    expect(sq(el, "textarea")).not.toBeNull()
  })

  it("shows default placeholder", async () => {
    el = await createElement("md-editor")
    expect(sq(el, "textarea")!.getAttribute("placeholder")).toBe("Enter Markdoc here...")
  })

  it("accepts custom placeholder", async () => {
    el = await createElement("md-editor", { placeholder: "Type here" })
    expect(sq(el, "textarea")!.getAttribute("placeholder")).toBe("Type here")
  })

  it("reflects value prop", async () => {
    el = await createElement("md-editor", { value: "hello" })
    const ta = sq(el, "textarea") as HTMLTextAreaElement
    expect(ta.textContent).toContain("hello")
  })

  it("emits input event on typing", async () => {
    el = await createElement("md-editor")
    let received: string | undefined
    el.addEventListener("input", ((e: CustomEvent) => {
      received = e.detail.value
    }) as EventListener)
    const ta = sq(el, "textarea") as HTMLTextAreaElement
    ta.value = "test"
    ta.dispatchEvent(new Event("input", { bubbles: true }))
    await new Promise((r) => setTimeout(r, 0))
    expect(received).toBe("test")
  })
})
