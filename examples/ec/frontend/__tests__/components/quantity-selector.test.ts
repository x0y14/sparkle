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

describe("ec-quantity-selector", () => {
  afterEach(() => {
    document.body.innerHTML = ""
  })

  test("SSR: value を表示", async () => {
    const { default: QS } = await import("../../src/components/ec-quantity-selector.js")
    const html = renderToString(QS, "ec-quantity-selector", { value: 3, min: 1, max: 10 })
    expect(html).toContain("3")
    expect(html).toContain("shadowrootmode")
  })

  test("DOM: 初期値 1 表示", async () => {
    await import("../../src/components/ec-quantity-selector.js")
    const el = document.createElement("ec-quantity-selector") as any
    el.setAttribute("value", "1")
    el.setAttribute("min", "1")
    el.setAttribute("max", "10")
    document.body.appendChild(el)
    await flushMicrotasks()
    expect(el.shadowRoot!.querySelector("[data-testid='value']")?.textContent?.trim()).toBe("1")
  })

  test("DOM: + で値増加", async () => {
    await import("../../src/components/ec-quantity-selector.js")
    const el = document.createElement("ec-quantity-selector") as any
    el.setAttribute("value", "1")
    el.setAttribute("max", "10")
    document.body.appendChild(el)
    await flushMicrotasks()
    el.shadowRoot!.querySelector("[data-action='increment']").click()
    await flushMicrotasks()
    expect(el.value).toBe(2)
  })

  test("DOM: − で値減少", async () => {
    await import("../../src/components/ec-quantity-selector.js")
    const el = document.createElement("ec-quantity-selector") as any
    el.setAttribute("value", "3")
    el.setAttribute("min", "1")
    el.setAttribute("max", "10")
    document.body.appendChild(el)
    await flushMicrotasks()
    el.shadowRoot!.querySelector("[data-action='decrement']").click()
    await flushMicrotasks()
    expect(el.value).toBe(2)
  })

  test("DOM: max 超えない", async () => {
    await import("../../src/components/ec-quantity-selector.js")
    const el = document.createElement("ec-quantity-selector") as any
    el.setAttribute("value", "3")
    el.setAttribute("max", "3")
    document.body.appendChild(el)
    await flushMicrotasks()
    el.shadowRoot!.querySelector("[data-action='increment']").click()
    await flushMicrotasks()
    expect(el.value).toBe(3)
  })

  test("DOM: min 下回らない", async () => {
    await import("../../src/components/ec-quantity-selector.js")
    const el = document.createElement("ec-quantity-selector") as any
    el.setAttribute("value", "1")
    el.setAttribute("min", "1")
    document.body.appendChild(el)
    await flushMicrotasks()
    el.shadowRoot!.querySelector("[data-action='decrement']").click()
    await flushMicrotasks()
    expect(el.value).toBe(1)
  })

  test("DOM: quantity-change イベント dispatch", async () => {
    await import("../../src/components/ec-quantity-selector.js")
    const el = document.createElement("ec-quantity-selector") as any
    el.setAttribute("value", "1")
    el.setAttribute("max", "10")
    document.body.appendChild(el)
    await flushMicrotasks()
    const events: number[] = []
    el.addEventListener("quantity-change", (e: CustomEvent<number>) => events.push(e.detail))
    el.shadowRoot!.querySelector("[data-action='increment']").click()
    await flushMicrotasks()
    expect(events).toEqual([2])
  })

  test("DOM: max 時に + ボタン disabled", async () => {
    await import("../../src/components/ec-quantity-selector.js")
    const el = document.createElement("ec-quantity-selector") as any
    el.setAttribute("value", "5")
    el.setAttribute("max", "5")
    document.body.appendChild(el)
    await flushMicrotasks()
    expect(el.shadowRoot!.querySelector("[data-action='increment']").hasAttribute("disabled")).toBe(
      true,
    )
  })

  test("DOM: min 時に − ボタン disabled", async () => {
    await import("../../src/components/ec-quantity-selector.js")
    const el = document.createElement("ec-quantity-selector") as any
    el.setAttribute("value", "1")
    el.setAttribute("min", "1")
    document.body.appendChild(el)
    await flushMicrotasks()
    expect(el.shadowRoot!.querySelector("[data-action='decrement']").hasAttribute("disabled")).toBe(
      true,
    )
  })
})
