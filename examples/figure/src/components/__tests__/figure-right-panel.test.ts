import { describe, it, expect, beforeAll } from "vitest"

describe("figure-right-panel", () => {
  beforeAll(async () => {
    await import("../figure-right-panel.js")
    await customElements.whenDefined("figure-right-panel")
  })

  function create(): HTMLElement {
    const el = document.createElement("figure-right-panel")
    document.body.appendChild(el)
    return el
  }

  it("カスタムエレメントが登録される", () => {
    expect(customElements.get("figure-right-panel")).toBeDefined()
  })

  it(".panel要素が存在し初期状態でcollapsedでない", async () => {
    const el = create()
    await new Promise((r) => setTimeout(r, 50))
    const panel = el.shadowRoot!.querySelector(".panel")
    expect(panel).not.toBeNull()
    expect(panel!.classList.contains("collapsed")).toBe(false)
  })

  it("スタイルシートが適用されている", async () => {
    const el = create()
    await new Promise((r) => setTimeout(r, 50))
    const hasStyles = el.shadowRoot!.querySelectorAll("style").length > 0
      || (el.shadowRoot!.adoptedStyleSheets && el.shadowRoot!.adoptedStyleSheets.length > 0)
    expect(hasStyles).toBe(true)
  })

  it("Properties, Position, Size, Fillセクションが存在する", async () => {
    const el = create()
    await new Promise((r) => setTimeout(r, 50))
    const text = el.shadowRoot!.innerHTML
    expect(text).toContain("Properties")
    expect(text).toContain("Position")
    expect(text).toContain("Size")
    expect(text).toContain("Fill")
  })

  it("トグルボタンクリックでcollapsedクラスが付与される", async () => {
    const el = create()
    await new Promise((r) => setTimeout(r, 50))
    const btn = el.shadowRoot!.querySelector(".toggle-btn") as HTMLElement
    btn.click()
    await new Promise((r) => setTimeout(r, 100))
    const panel = el.shadowRoot!.querySelector(".panel")
    expect(panel!.classList.contains("collapsed")).toBe(true)
  })

  it("再度クリックでcollapsedが解除される", async () => {
    const el = create()
    await new Promise((r) => setTimeout(r, 50))
    const btn = el.shadowRoot!.querySelector(".toggle-btn") as HTMLElement
    btn.click()
    await new Promise((r) => setTimeout(r, 100))
    btn.click()
    await new Promise((r) => setTimeout(r, 100))
    const panel = el.shadowRoot!.querySelector(".panel")
    expect(panel!.classList.contains("collapsed")).toBe(false)
  })
})
