import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, cleanup } from "../src/utils/test-helpers"
import "../src/components/md-preview"

describe("md-preview", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders container div", async () => {
    el = await createElement("md-preview")
    expect(sq(el, "div")).not.toBeNull()
  })

  it("shows placeholder when no content", async () => {
    el = await createElement("md-preview")
    expect(sq(el, "p")!.textContent).toContain("Preview will appear here")
  })

  it("renders HTML content", async () => {
    el = await createElement("md-preview")
    ;(el as any).content = "<h1>Hello</h1>"
    await new Promise((r) => setTimeout(r, 0))
    const h1 = sq(el, "h1")
    expect(h1).not.toBeNull()
    expect(h1!.textContent).toBe("Hello")
  })

  it("updates when content changes", async () => {
    el = await createElement("md-preview")
    ;(el as any).content = "<p>First</p>"
    await new Promise((r) => setTimeout(r, 0))
    expect(sq(el, "p")!.textContent).toBe("First")
    ;(el as any).content = "<p>Second</p>"
    await new Promise((r) => setTimeout(r, 0))
    expect(sq(el, "p")!.textContent).toBe("Second")
  })

  it("emits preview-click event on content click", async () => {
    el = await createElement("md-preview")
    ;(el as any).content = '<h1 data-offset-end="7">Hello</h1>'
    await new Promise((r) => setTimeout(r, 0))
    let received: number | undefined
    el.addEventListener("preview-click", ((e: CustomEvent) => {
      received = e.detail.offset
    }) as EventListener)
    const h1 = sq(el, "h1") as HTMLElement
    h1.click()
    await new Promise((r) => setTimeout(r, 0))
    expect(received).toBe(7)
  })

  it("adds highlight-hover class on mouseover", async () => {
    el = await createElement("md-preview")
    ;(el as any).content = '<h1 data-offset-start="0" data-offset-end="7">Hello</h1>'
    await new Promise((r) => setTimeout(r, 0))
    const h1 = sq(el, "h1") as HTMLElement
    h1.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }))
    await new Promise((r) => setTimeout(r, 0))
    expect(h1.classList.contains("highlight-hover")).toBe(true)
  })

  it("removes highlight-hover on mouseleave", async () => {
    el = await createElement("md-preview")
    ;(el as any).content = '<h1 data-offset-start="0" data-offset-end="7">Hello</h1>'
    await new Promise((r) => setTimeout(r, 0))
    const h1 = sq(el, "h1") as HTMLElement
    h1.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }))
    await new Promise((r) => setTimeout(r, 0))
    expect(h1.classList.contains("highlight-hover")).toBe(true)
    el.shadowRoot!.dispatchEvent(new MouseEvent("mouseleave"))
    await new Promise((r) => setTimeout(r, 0))
    expect(h1.classList.contains("highlight-hover")).toBe(false)
  })

  it("moves highlight-hover to different element", async () => {
    el = await createElement("md-preview")
    ;(el as any).content = '<h1 data-offset-start="0" data-offset-end="7">Title</h1><p data-offset-start="8" data-offset-end="20">Text</p>'
    await new Promise((r) => setTimeout(r, 0))
    const h1 = sq(el, "h1") as HTMLElement
    const p = sq(el, "p") as HTMLElement
    h1.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }))
    await new Promise((r) => setTimeout(r, 0))
    expect(h1.classList.contains("highlight-hover")).toBe(true)
    p.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }))
    await new Promise((r) => setTimeout(r, 0))
    expect(h1.classList.contains("highlight-hover")).toBe(false)
    expect(p.classList.contains("highlight-hover")).toBe(true)
  })

  it("clears highlight-active when hover starts", async () => {
    el = await createElement("md-preview")
    ;(el as any).content = '<h1 data-offset-start="0" data-offset-end="7">Hello</h1>'
    await new Promise((r) => setTimeout(r, 0))
    const h1 = sq(el, "h1") as HTMLElement
    h1.classList.add("highlight-active")
    h1.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }))
    await new Promise((r) => setTimeout(r, 0))
    expect(h1.classList.contains("highlight-active")).toBe(false)
    expect(h1.classList.contains("highlight-hover")).toBe(true)
  })

  it("emits preview-hover-end on mouseleave", async () => {
    el = await createElement("md-preview")
    ;(el as any).content = '<h1 data-offset-start="0" data-offset-end="7">Hello</h1>'
    await new Promise((r) => setTimeout(r, 0))
    let hoverEndFired = false
    el.addEventListener("preview-hover-end", () => { hoverEndFired = true })
    el.shadowRoot!.dispatchEvent(new MouseEvent("mouseleave"))
    await new Promise((r) => setTimeout(r, 0))
    expect(hoverEndFired).toBe(true)
  })
})
