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

  it("rendered elements have data-offset attributes", async () => {
    el = await createElement("md-live-preview")
    const editor = sq(el, "md-editor") as HTMLElement
    const ta = sq(editor, "textarea") as HTMLTextAreaElement
    ta.value = "# Hello"
    ta.dispatchEvent(new Event("input", { bubbles: true }))
    await new Promise((r) => setTimeout(r, 50))
    const preview = sq(el, "md-preview") as HTMLElement
    const h1 = sq(preview, "h1")
    expect(h1).not.toBeNull()
    expect(h1!.hasAttribute("data-offset-start")).toBe(true)
    expect(h1!.hasAttribute("data-offset-end")).toBe(true)
  })

  it("highlights preview element on cursor move", async () => {
    el = await createElement("md-live-preview")
    const editor = sq(el, "md-editor") as HTMLElement
    const ta = sq(editor, "textarea") as HTMLTextAreaElement
    ta.value = "# Hello"
    ta.dispatchEvent(new Event("input", { bubbles: true }))
    await new Promise((r) => setTimeout(r, 50))
    ta.setSelectionRange(2, 2)
    ta.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    await new Promise((r) => setTimeout(r, 50))
    const preview = sq(el, "md-preview") as HTMLElement
    const h1 = sq(preview, "h1")
    expect(h1).not.toBeNull()
    expect(h1!.classList.contains("highlight-active")).toBe(true)
  })

  it("highlights inline strong element precisely", async () => {
    el = await createElement("md-live-preview")
    const editor = sq(el, "md-editor") as HTMLElement
    const ta = sq(editor, "textarea") as HTMLTextAreaElement
    ta.value = "**bold** text"
    ta.dispatchEvent(new Event("input", { bubbles: true }))
    await new Promise((r) => setTimeout(r, 50))
    ta.setSelectionRange(3, 3)
    ta.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    await new Promise((r) => setTimeout(r, 50))
    const preview = sq(el, "md-preview") as HTMLElement
    const strong = sq(preview, "strong")
    expect(strong).not.toBeNull()
    expect(strong!.classList.contains("highlight-active")).toBe(true)
    const p = sq(preview, "p")
    expect(p!.classList.contains("highlight-active")).toBe(false)
  })

  it("highlights inline em element precisely", async () => {
    el = await createElement("md-live-preview")
    const editor = sq(el, "md-editor") as HTMLElement
    const ta = sq(editor, "textarea") as HTMLTextAreaElement
    ta.value = "**bold** and *italic*"
    ta.dispatchEvent(new Event("input", { bubbles: true }))
    await new Promise((r) => setTimeout(r, 50))
    ta.setSelectionRange(15, 15)
    ta.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    await new Promise((r) => setTimeout(r, 50))
    const preview = sq(el, "md-preview") as HTMLElement
    const em = sq(preview, "em")
    expect(em).not.toBeNull()
    expect(em!.classList.contains("highlight-active")).toBe(true)
    const strong = sq(preview, "strong")
    expect(strong!.classList.contains("highlight-active")).toBe(false)
  })

  it("moves highlight when cursor moves to different element", async () => {
    el = await createElement("md-live-preview")
    const editor = sq(el, "md-editor") as HTMLElement
    const ta = sq(editor, "textarea") as HTMLTextAreaElement
    ta.value = "# Heading\n\nParagraph"
    ta.dispatchEvent(new Event("input", { bubbles: true }))
    await new Promise((r) => setTimeout(r, 50))
    ta.setSelectionRange(2, 2)
    ta.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    await new Promise((r) => setTimeout(r, 50))
    const preview = sq(el, "md-preview") as HTMLElement
    expect(sq(preview, "h1")!.classList.contains("highlight-active")).toBe(true)
    ta.setSelectionRange(15, 15)
    ta.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    await new Promise((r) => setTimeout(r, 50))
    expect(sq(preview, "h1")!.classList.contains("highlight-active")).toBe(false)
    expect(sq(preview, "p")!.classList.contains("highlight-active")).toBe(true)
  })

  it("re-applies highlight after content change", async () => {
    el = await createElement("md-live-preview")
    const editor = sq(el, "md-editor") as HTMLElement
    const ta = sq(editor, "textarea") as HTMLTextAreaElement
    ta.value = "# Hello"
    ta.dispatchEvent(new Event("input", { bubbles: true }))
    await new Promise((r) => setTimeout(r, 50))
    ta.setSelectionRange(2, 2)
    ta.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    await new Promise((r) => setTimeout(r, 50))
    const preview = sq(el, "md-preview") as HTMLElement
    expect(sq(preview, "h1")!.classList.contains("highlight-active")).toBe(true)
    ta.value = "# World"
    ta.dispatchEvent(new Event("input", { bubbles: true }))
    await new Promise((r) => setTimeout(r, 100))
    expect(sq(preview, "h1")!.classList.contains("highlight-active")).toBe(true)
  })

  it("highlights element when cursor is at end of line", async () => {
    el = await createElement("md-live-preview")
    const editor = sq(el, "md-editor") as HTMLElement
    const ta = sq(editor, "textarea") as HTMLTextAreaElement
    ta.value = "# Hello"
    ta.dispatchEvent(new Event("input", { bubbles: true }))
    await new Promise((r) => setTimeout(r, 50))
    ta.setSelectionRange(7, 7)
    ta.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    await new Promise((r) => setTimeout(r, 50))
    const preview = sq(el, "md-preview") as HTMLElement
    const h1 = sq(preview, "h1")
    expect(h1).not.toBeNull()
    expect(h1!.classList.contains("highlight-active")).toBe(true)
  })

  it("moves editor cursor to end of clicked preview element", async () => {
    el = await createElement("md-live-preview")
    const editor = sq(el, "md-editor") as HTMLElement
    const ta = sq(editor, "textarea") as HTMLTextAreaElement
    ta.value = "# Hello\n\nParagraph"
    ta.dispatchEvent(new Event("input", { bubbles: true }))
    await new Promise((r) => setTimeout(r, 50))
    const preview = sq(el, "md-preview") as HTMLElement
    const h1 = sq(preview, "h1") as HTMLElement
    h1.click()
    await new Promise((r) => setTimeout(r, 50))
    // "# Hello\n" → lineOffsets[1] = 8 → data-offset-end="8"
    expect(ta.selectionStart).toBe(8)
    expect(ta.selectionEnd).toBe(8)
  })

  it("moves editor cursor when clicking inline element", async () => {
    el = await createElement("md-live-preview")
    const editor = sq(el, "md-editor") as HTMLElement
    const ta = sq(editor, "textarea") as HTMLTextAreaElement
    ta.value = "**bold** text"
    ta.dispatchEvent(new Event("input", { bubbles: true }))
    await new Promise((r) => setTimeout(r, 50))
    const preview = sq(el, "md-preview") as HTMLElement
    const strong = sq(preview, "strong") as HTMLElement
    strong.click()
    await new Promise((r) => setTimeout(r, 50))
    expect(ta.selectionStart).toBe(8)
    expect(ta.selectionEnd).toBe(8)
  })

  it("re-applies cursor highlight after hover ends", async () => {
    el = await createElement("md-live-preview")
    const editor = sq(el, "md-editor") as HTMLElement
    const ta = sq(editor, "textarea") as HTMLTextAreaElement
    ta.value = "# Hello\n\nParagraph"
    ta.dispatchEvent(new Event("input", { bubbles: true }))
    await new Promise((r) => setTimeout(r, 50))
    ta.setSelectionRange(2, 2)
    ta.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    await new Promise((r) => setTimeout(r, 50))
    const preview = sq(el, "md-preview") as HTMLElement
    expect(sq(preview, "h1")!.classList.contains("highlight-active")).toBe(true)
    // ホバー開始 → highlight-active が消える
    const p = sq(preview, "p") as HTMLElement
    p.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }))
    await new Promise((r) => setTimeout(r, 50))
    expect(sq(preview, "h1")!.classList.contains("highlight-active")).toBe(false)
    expect(p.classList.contains("highlight-hover")).toBe(true)
    // ホバー終了 → highlight-active が再適用
    preview.shadowRoot!.dispatchEvent(new MouseEvent("mouseleave"))
    await new Promise((r) => setTimeout(r, 50))
    expect(p.classList.contains("highlight-hover")).toBe(false)
    expect(sq(preview, "h1")!.classList.contains("highlight-active")).toBe(true)
  })
})
