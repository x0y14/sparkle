import { describe, test, expect, afterEach } from "vitest"
import { renderToString } from "@blask/core"

function flushMicrotasks(rounds = 5): Promise<void> {
  return new Promise((r) => {
    let n = rounds
    function s() {
      if (--n <= 0) r()
      else queueMicrotask(s)
    }
    queueMicrotask(s)
  })
}

describe("ec-form-field", () => {
  afterEach(() => {
    document.body.innerHTML = ""
  })

  test("SSR: label 表示", async () => {
    const { default: FF } = await import("../../src/components/ec-form-field.js")
    const html = renderToString(FF, "ec-form-field", { label: "お名前", name: "name" })
    expect(html).toContain("お名前")
  })

  test("SSR: data-field 属性に name prop の値", async () => {
    const { default: FF } = await import("../../src/components/ec-form-field.js")
    const html = renderToString(FF, "ec-form-field", { label: "お名前", name: "name" })
    expect(html).toContain('data-field="name"')
  })

  test("SSR: type=email で input type 設定", async () => {
    const { default: FF } = await import("../../src/components/ec-form-field.js")
    const html = renderToString(FF, "ec-form-field", {
      label: "メール",
      name: "email",
      type: "email",
    })
    expect(html).toContain('type="email"')
  })

  test("SSR: rows>0 で textarea 描画", async () => {
    const { default: FF } = await import("../../src/components/ec-form-field.js")
    const html = renderToString(FF, "ec-form-field", { label: "住所", name: "address", rows: 3 })
    expect(html).toContain("<textarea")
    expect(html).toContain('rows="3"')
  })

  test("SSR: rows=0 で input 描画", async () => {
    const { default: FF } = await import("../../src/components/ec-form-field.js")
    const html = renderToString(FF, "ec-form-field", { label: "お名前", name: "name" })
    expect(html).toContain("<input")
    expect(html).not.toContain("<textarea")
  })

  test("SSR: value prop が反映される", async () => {
    const { default: FF } = await import("../../src/components/ec-form-field.js")
    const html = renderToString(FF, "ec-form-field", {
      label: "お名前",
      name: "name",
      value: "太郎",
    })
    expect(html).toContain("太郎")
  })

  test("DOM: field-change イベント dispatch", async () => {
    await import("../../src/components/ec-form-field.js")
    const el = document.createElement("ec-form-field") as any
    el.setAttribute("label", "お名前")
    el.setAttribute("name", "name")
    document.body.appendChild(el)
    await flushMicrotasks()
    const events: Array<{ name: string; value: string }> = []
    el.addEventListener("field-change", (e: CustomEvent) => events.push(e.detail))
    const input = el.shadowRoot!.querySelector("input")!
    ;(input as any).value = "太郎"
    input.dispatchEvent(new Event("input", { bubbles: true }))
    await flushMicrotasks()
    expect(events.length).toBe(1)
    expect(events[0]).toEqual({ name: "name", value: "太郎" })
  })
})
