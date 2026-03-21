import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, cleanup } from "../src/utils/test-helpers"
import "../src/components/md-editor"
import "../src/components/md-preview"
import "../src/components/md-live-preview"

describe("md-live-preview", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders editor and preview panels", async () => {
    el = await createElement("md-live-preview")
    expect(sq(el, "md-editor")).not.toBeNull()
    expect(sq(el, "md-preview")).not.toBeNull()
  })

  it("renders markdoc in real-time on input", async () => {
    el = await createElement("md-live-preview")
    const editor = sq(el, "md-editor") as HTMLElement
    const ta = sq(editor, "textarea") as HTMLTextAreaElement
    ta.value = "# Hello"
    ta.dispatchEvent(new Event("input", { bubbles: true }))
    await new Promise((r) => setTimeout(r, 50))
    const preview = sq(el, "md-preview") as HTMLElement
    const h1 = sq(preview, "h1")
    expect(h1).not.toBeNull()
    expect(h1!.textContent).toContain("Hello")
  })

  it("shows placeholder when input is empty", async () => {
    el = await createElement("md-live-preview")
    const preview = sq(el, "md-preview") as HTMLElement
    expect(sq(preview, "p")!.textContent).toContain("Preview will appear here")
  })
})
