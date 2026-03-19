import { describe, it, expect, beforeAll } from "vitest"

describe("figure-tool-button", () => {
  beforeAll(async () => {
    await import("../figure-tool-button.js")
    await customElements.whenDefined("figure-tool-button")
  })

  function create(attrs: Record<string, string> = {}): HTMLElement {
    const el = document.createElement("figure-tool-button")
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v)
    document.body.appendChild(el)
    return el
  }

  it("カスタムエレメントが登録される", () => {
    expect(customElements.get("figure-tool-button")).toBeDefined()
  })

  it("shadow DOM内にbuttonが存在する", async () => {
    const el = create({ icon: "pointer", tooltip: "Select" })
    await new Promise((r) => setTimeout(r, 50))
    expect(el.shadowRoot!.querySelector("button")).not.toBeNull()
  })

  it("icon propに応じたSVGが描画される", async () => {
    const el = create({ icon: "pointer" })
    await new Promise((r) => setTimeout(r, 50))
    expect(el.shadowRoot!.querySelector("svg")).not.toBeNull()
  })

  it("tooltip propがbutton titleに設定される", async () => {
    const el = create({ icon: "pointer", tooltip: "Select Tool" })
    await new Promise((r) => setTimeout(r, 50))
    expect(el.shadowRoot!.querySelector("button")!.getAttribute("title")).toBe("Select Tool")
  })

  it("active属性がreflectされる", async () => {
    const el = create({ icon: "pointer" }) as any
    await new Promise((r) => setTimeout(r, 50))
    el.active = true
    expect(el.hasAttribute("active")).toBe(true)
    el.active = false
    expect(el.hasAttribute("active")).toBe(false)
  })
})
