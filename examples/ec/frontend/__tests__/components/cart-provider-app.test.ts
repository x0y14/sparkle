import { describe, test, expect, afterEach, vi } from "vitest"

let callCount = 0
vi.mock("../../src/lib/api.js", () => ({
  fetchCart: vi.fn(async () => {
    callCount++
    return {
      sessionId: "s",
      items: [
        {
          productId: `p${callCount}`,
          quantity: callCount,
          product: {
            id: `p${callCount}`,
            name: "A",
            price: 100,
            image: "",
            category: "",
            stock: 5,
          },
        },
      ],
    }
  }),
  addToCart: vi.fn(async () => {}),
  removeCartItem: vi.fn(async () => {}),
  updateCartItem: vi.fn(async () => {}),
}))

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

describe("ec-cart-provider-app", () => {
  afterEach(() => {
    document.body.innerHTML = ""
  })

  test("DOM: ec-cart-provider を含む shadowRoot をレンダー", async () => {
    await import("../../src/context/cart-context.js")
    await import("../../src/components/ec-cart-provider-app.js")
    const el = document.createElement("ec-cart-provider-app")
    el.innerHTML = "<span>child</span>"
    document.body.appendChild(el)
    await flushMicrotasks()
    expect(el.shadowRoot!.querySelector("ec-cart-provider")).not.toBeNull()
  })

  test("DOM: items 更新時に cart-changed イベントを dispatch", async () => {
    await import("../../src/context/cart-context.js")
    await import("../../src/components/ec-cart-provider-app.js")
    const el = document.createElement("ec-cart-provider-app")
    document.body.appendChild(el)
    // wait for initial render + refresh to settle
    await new Promise((r) => setTimeout(r, 50))
    const received: Event[] = []
    el.addEventListener("cart-changed", (e) => received.push(e))
    // 強制的に items 更新をトリガー（refresh → setItems）
    el.dispatchEvent(new CustomEvent("cart-add"))
    await new Promise((r) => setTimeout(r, 50))
    expect(received.length).toBeGreaterThanOrEqual(1)
  })

  test("DOM: slot で子要素をスルー", async () => {
    await import("../../src/context/cart-context.js")
    await import("../../src/components/ec-cart-provider-app.js")
    const el = document.createElement("ec-cart-provider-app")
    el.innerHTML = "<span>child</span>"
    document.body.appendChild(el)
    await flushMicrotasks()
    const provider = el.shadowRoot!.querySelector("ec-cart-provider")
    expect(provider).not.toBeNull()
    const slot = provider!.shadowRoot?.querySelector("slot")
    expect(slot).not.toBeNull()
  })
})
