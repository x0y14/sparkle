import { describe, it, expect, beforeAll } from "vitest"

describe("figure-header", () => {
  beforeAll(async () => {
    await import("../figure-tool-button.js")
    await import("../figure-header.js")
    await customElements.whenDefined("figure-header")
  })

  function create(): HTMLElement {
    const el = document.createElement("figure-header")
    document.body.appendChild(el)
    return el
  }

  it("カスタムエレメントが登録される", () => {
    expect(customElements.get("figure-header")).toBeDefined()
  })

  it("ロゴテキスト'Figure'が表示される", async () => {
    const el = create()
    await new Promise((r) => setTimeout(r, 50))
    const logo = el.shadowRoot!.querySelector(".logo")
    expect(logo?.textContent).toBe("Figure")
  })

  it("ファイル名'Untitled'が表示される", async () => {
    const el = create()
    await new Promise((r) => setTimeout(r, 50))
    const filename = el.shadowRoot!.querySelector(".filename")
    expect(filename?.textContent).toBe("Untitled")
  })
})
