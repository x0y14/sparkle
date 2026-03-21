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
})
