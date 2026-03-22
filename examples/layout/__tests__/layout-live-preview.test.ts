import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, cleanup } from "../src/utils/test-helpers"
import "../src/components/layout-editor"
import "../src/components/layout-preview"
import "../src/components/layout-live-preview"

describe("layout-live-preview", () => {
  let el: HTMLElement
  afterEach(() => {
    if (el) cleanup(el)
  })

  it("renders editor and preview panels", async () => {
    el = await createElement("layout-live-preview")
    expect(sq(el, "layout-editor")).not.toBeNull()
    expect(sq(el, "layout-preview")).not.toBeNull()
  })

  it("renders header with title", async () => {
    el = await createElement("layout-live-preview")
    const h1 = sq(el, "h1")
    expect(h1).not.toBeNull()
    expect(h1!.textContent).toContain("Layout Live Preview")
  })

  it("renders layout in real-time on input", async () => {
    el = await createElement("layout-live-preview")
    const editor = sq(el, "layout-editor") as HTMLElement
    const ta = sq(editor, "textarea") as HTMLTextAreaElement
    ta.value = '{"type":"item","id":"hello"}'
    ta.dispatchEvent(new Event("input", { bubbles: true }))
    await new Promise((r) => setTimeout(r, 50))
    const preview = sq(el, "layout-preview") as HTMLElement
    const item = sq(preview, "[data-node-id='hello']")
    expect(item).not.toBeNull()
  })

  it("shows placeholder when input is empty", async () => {
    el = await createElement("layout-live-preview")
    const preview = sq(el, "layout-preview") as HTMLElement
    expect(sq(preview, "p")!.textContent).toContain("Preview will appear here")
  })

  it("shows error state for invalid JSON input", async () => {
    el = await createElement("layout-live-preview")
    const editor = sq(el, "layout-editor") as HTMLElement
    const ta = sq(editor, "textarea") as HTMLTextAreaElement
    ta.value = "{not valid"
    ta.dispatchEvent(new Event("input", { bubbles: true }))
    await new Promise((r) => setTimeout(r, 50))
    const preview = sq(el, "layout-preview") as HTMLElement
    const errorEl = sq(preview, "[data-error]")
    expect(errorEl).not.toBeNull()
  })

  it("updates preview when JSON changes", async () => {
    el = await createElement("layout-live-preview")
    const editor = sq(el, "layout-editor") as HTMLElement
    const ta = sq(editor, "textarea") as HTMLTextAreaElement
    ta.value = '{"type":"item","id":"first"}'
    ta.dispatchEvent(new Event("input", { bubbles: true }))
    await new Promise((r) => setTimeout(r, 50))
    const preview = sq(el, "layout-preview") as HTMLElement
    expect(sq(preview, "[data-node-id='first']")).not.toBeNull()
    ta.value = '{"type":"item","id":"second"}'
    ta.dispatchEvent(new Event("input", { bubbles: true }))
    await new Promise((r) => setTimeout(r, 50))
    expect(sq(preview, "[data-node-id='second']")).not.toBeNull()
    expect(sq(preview, "[data-node-id='first']")).toBeNull()
  })

  it("renders inspector", async () => {
    el = await createElement("layout-live-preview")
    expect(sq(el, "layout-node-inspector")).not.toBeNull()
  })

  it("renders toolbox", async () => {
    el = await createElement("layout-live-preview")
    expect(sq(el, "layout-toolbox")).not.toBeNull()
  })

  it("updates editor when layout-change event is received", async () => {
    el = await createElement("layout-live-preview")
    const preview = sq(el, "layout-preview") as HTMLElement
    const newTree = {
      type: "layout", direction: "vertical",
      children: [{ type: "item", id: "moved" }],
    }
    preview.dispatchEvent(new CustomEvent("layout-change", {
      detail: { tree: newTree },
      bubbles: true,
      composed: true,
    }))
    await new Promise((r) => setTimeout(r, 50))
    const editor = sq(el, "layout-editor") as HTMLElement
    const ta = sq(editor, "textarea") as HTMLTextAreaElement
    expect(ta.value).toContain('"moved"')
  })
})
