import { describe, it, expect, beforeAll, vi } from "vitest"

describe("figure-left-toolbar", () => {
  beforeAll(async () => {
    await import("../figure-tool-button.js")
    await import("../figure-left-toolbar.js")
    await customElements.whenDefined("figure-left-toolbar")
  })

  function create(): HTMLElement {
    const el = document.createElement("figure-left-toolbar")
    document.body.appendChild(el)
    return el
  }

  it("カスタムエレメントが登録される", () => {
    expect(customElements.get("figure-left-toolbar")).toBeDefined()
  })

  it("ツールボタンが4つある", async () => {
    const el = create()
    await new Promise((r) => setTimeout(r, 50))
    const buttons = el.shadowRoot!.querySelectorAll("figure-tool-button")
    expect(buttons.length).toBe(4)
  })

  it("各ボタンのiconが正しい", async () => {
    const el = create()
    await new Promise((r) => setTimeout(r, 50))
    const buttons = el.shadowRoot!.querySelectorAll("figure-tool-button")
    const icons = Array.from(buttons).map(b => b.getAttribute("icon"))
    expect(icons).toEqual(["pointer", "rectangle", "hand", "plus"])
  })

  it("plusボタンクリックでfigure:add-rectイベントが発火する", async () => {
    const el = create()
    await new Promise((r) => setTimeout(r, 100))
    const handler = vi.fn()
    window.addEventListener("figure:add-rect", handler)
    try {
      const plusBtn = el.shadowRoot!.querySelector('[data-action="add-rect"]') as HTMLElement
      plusBtn?.click()
      await new Promise((r) => setTimeout(r, 50))
      expect(handler).toHaveBeenCalled()
    } finally {
      window.removeEventListener("figure:add-rect", handler)
    }
  })
})
