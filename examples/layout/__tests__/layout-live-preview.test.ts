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

  describe("view mode toggle", () => {
    it("shows toggle buttons in header", async () => {
      el = await createElement("layout-live-preview")
      expect(sq(el, "button[data-mode='preview']")).not.toBeNull()
      expect(sq(el, "button[data-mode='editor']")).not.toBeNull()
    })

    it("hides editor panel by default", async () => {
      el = await createElement("layout-live-preview")
      const editorPanel = sq(el, "[data-panel='editor']") as HTMLElement
      expect(editorPanel.style.display).toBe("none")
    })

    it("shows preview panel by default", async () => {
      el = await createElement("layout-live-preview")
      const previewPanel = sq(el, "[data-panel='preview']") as HTMLElement
      expect(previewPanel.style.display).not.toBe("none")
    })

    it("preview button is active by default", async () => {
      el = await createElement("layout-live-preview")
      const previewBtn = sq(el, "button[data-mode='preview']") as HTMLElement
      const editorBtn = sq(el, "button[data-mode='editor']") as HTMLElement
      expect(previewBtn.classList.contains("active")).toBe(true)
      expect(editorBtn.classList.contains("active")).toBe(false)
    })

    it("switches to editor view on editor button click", async () => {
      el = await createElement("layout-live-preview")
      const editorBtn = sq(el, "button[data-mode='editor']") as HTMLElement
      editorBtn.click()
      await new Promise((r) => setTimeout(r, 0))
      const editorPanel = sq(el, "[data-panel='editor']") as HTMLElement
      const previewPanel = sq(el, "[data-panel='preview']") as HTMLElement
      expect(editorPanel.style.display).not.toBe("none")
      expect(previewPanel.style.display).toBe("none")
    })

    it("switches back to preview on preview button click", async () => {
      el = await createElement("layout-live-preview")
      const editorBtn = sq(el, "button[data-mode='editor']") as HTMLElement
      const previewBtn = sq(el, "button[data-mode='preview']") as HTMLElement
      editorBtn.click()
      await new Promise((r) => setTimeout(r, 0))
      previewBtn.click()
      await new Promise((r) => setTimeout(r, 0))
      const editorPanel = sq(el, "[data-panel='editor']") as HTMLElement
      const previewPanel = sq(el, "[data-panel='preview']") as HTMLElement
      expect(editorPanel.style.display).toBe("none")
      expect(previewPanel.style.display).not.toBe("none")
    })

    it("toggles active class on buttons", async () => {
      el = await createElement("layout-live-preview")
      const editorBtn = sq(el, "button[data-mode='editor']") as HTMLElement
      const previewBtn = sq(el, "button[data-mode='preview']") as HTMLElement
      editorBtn.click()
      await new Promise((r) => setTimeout(r, 0))
      expect(editorBtn.classList.contains("active")).toBe(true)
      expect(previewBtn.classList.contains("active")).toBe(false)
    })

    it("keeps data in sync after toggling", async () => {
      el = await createElement("layout-live-preview")
      // editor モードに切り替え
      const editorBtn = sq(el, "button[data-mode='editor']") as HTMLElement
      editorBtn.click()
      await new Promise((r) => setTimeout(r, 0))
      // editor に JSON を入力
      const editor = sq(el, "layout-editor") as HTMLElement
      const ta = sq(editor, "textarea") as HTMLTextAreaElement
      ta.value = '{"type":"item","id":"synced"}'
      ta.dispatchEvent(new Event("input", { bubbles: true }))
      await new Promise((r) => setTimeout(r, 50))
      // preview モードに切り替え
      const previewBtn = sq(el, "button[data-mode='preview']") as HTMLElement
      previewBtn.click()
      await new Promise((r) => setTimeout(r, 0))
      // preview に反映されている
      const preview = sq(el, "layout-preview") as HTMLElement
      expect(sq(preview, "[data-node-id='synced']")).not.toBeNull()
    })
  })

  it("updates item width via inspector", async () => {
    el = await createElement("layout-live-preview")
    // editor モードに切り替え
    const editorBtn = sq(el, "button[data-mode='editor']") as HTMLElement
    editorBtn.click()
    await new Promise((r) => setTimeout(r, 0))
    // editor に JSON を入力
    const editor = sq(el, "layout-editor") as HTMLElement
    const ta = sq(editor, "textarea") as HTMLTextAreaElement
    ta.value = '{"type":"item","id":"test","width":"auto","height":"auto"}'
    ta.dispatchEvent(new Event("input", { bubbles: true }))
    await new Promise((r) => setTimeout(r, 50))
    // preview モードに切り替えて item を選択
    const previewBtn = sq(el, "button[data-mode='preview']") as HTMLElement
    previewBtn.click()
    await new Promise((r) => setTimeout(r, 0))
    const preview = sq(el, "layout-preview") as HTMLElement
    const item = sq(preview, "[data-node-id='test']") as HTMLElement
    item.click()
    await new Promise((r) => setTimeout(r, 50))
    // inspector から width 変更
    const inspector = sq(el, "layout-node-inspector") as HTMLElement
    inspector.dispatchEvent(new CustomEvent("width-change", {
      detail: { width: "200px" }, bubbles: true, composed: true,
    }))
    await new Promise((r) => setTimeout(r, 50))
    expect(ta.value).toContain('"200px"')
  })
})
