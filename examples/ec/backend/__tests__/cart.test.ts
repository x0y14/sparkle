import { describe, test, expect, beforeEach } from "vitest"
import { app } from "../src/index.js"
import { resetStore } from "../src/store.js"

const SESSION = { headers: { "x-session-id": "test-session-1" } }

function postItem(body: any, session = "test-session-1") {
  return app.request("/api/cart/items", {
    method: "POST",
    headers: { "x-session-id": session, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

describe("Cart API", () => {
  beforeEach(() => resetStore())

  test("空カートを取得", async () => {
    const res = await app.request("/api/cart", SESSION)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.items).toHaveLength(0)
    expect(data.sessionId).toBe("test-session-1")
  })

  test("x-session-id なしは 400", async () => {
    const res = await app.request("/api/cart")
    expect(res.status).toBe(400)
  })

  test("商品追加 → 201", async () => {
    const res = await postItem({ productId: "san-001", quantity: 2 })
    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data.items).toHaveLength(1)
    expect(data.items[0]).toEqual({ productId: "san-001", quantity: 2 })
  })

  test("存在しない商品は 404", async () => {
    const res = await postItem({ productId: "nonexistent", quantity: 1 })
    expect(res.status).toBe(404)
  })

  test("在庫超過は 400", async () => {
    const res = await postItem({ productId: "san-001", quantity: 999 })
    expect(res.status).toBe(400)
  })

  test("同一商品の追加は数量加算", async () => {
    await postItem({ productId: "san-001", quantity: 1 })
    await postItem({ productId: "san-001", quantity: 3 })
    const res = await app.request("/api/cart", SESSION)
    const data = await res.json()
    expect(data.items).toHaveLength(1)
    expect(data.items[0].quantity).toBe(4)
  })

  test("数量更新", async () => {
    await postItem({ productId: "san-001", quantity: 1 })
    const res = await app.request("/api/cart/items/san-001", {
      method: "PUT",
      headers: { "x-session-id": "test-session-1", "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: 5 }),
    })
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.items[0].quantity).toBe(5)
  })

  test("カートにない商品の更新は 404", async () => {
    const res = await app.request("/api/cart/items/san-001", {
      method: "PUT",
      headers: { "x-session-id": "test-session-1", "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: 1 }),
    })
    expect(res.status).toBe(404)
  })

  test("商品削除", async () => {
    await postItem({ productId: "san-001", quantity: 1 })
    const res = await app.request("/api/cart/items/san-001", {
      method: "DELETE",
      headers: { "x-session-id": "test-session-1" },
    })
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.items).toHaveLength(0)
  })

  test("セッション分離", async () => {
    await postItem({ productId: "san-001", quantity: 1 }, "session-A")
    const res = await app.request("/api/cart", { headers: { "x-session-id": "session-B" } })
    const data = await res.json()
    expect(data.items).toHaveLength(0)
  })

  test("GET /api/cart は product 情報を含む", async () => {
    await postItem({ productId: "san-001", quantity: 1 })
    const res = await app.request("/api/cart", SESSION)
    const data = await res.json()
    expect(data.items[0].product.name).toBe("EVAクロッグサンダル")
    expect(data.items[0].product.price).toBe(3900)
  })
})
