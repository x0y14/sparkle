import { describe, test, expect, vi, beforeEach } from "vitest"

const mockFetch = vi.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve({}),
})
vi.stubGlobal("fetch", mockFetch)

vi.stubGlobal("localStorage", {
  _store: {} as Record<string, string>,
  getItem(key: string) {
    return this._store[key] ?? null
  },
  setItem(key: string, v: string) {
    this._store[key] = v
  },
})

describe("api.ts", () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  test("fetchProducts は /api/products を GET", async () => {
    const { fetchProducts } = await import("../../src/lib/api.js")
    await fetchProducts()
    expect(mockFetch).toHaveBeenCalledWith("/api/products")
  })

  test("fetchProducts(category) はクエリパラメータ付き", async () => {
    const { fetchProducts } = await import("../../src/lib/api.js")
    await fetchProducts("sandals")
    expect(mockFetch).toHaveBeenCalledWith("/api/products?category=sandals")
  })

  test("fetchProduct は /api/products/:id を GET", async () => {
    const { fetchProduct } = await import("../../src/lib/api.js")
    await fetchProduct("t-001")
    expect(mockFetch).toHaveBeenCalledWith("/api/products/t-001")
  })

  test("addToCart は /api/cart/items に POST", async () => {
    const { addToCart } = await import("../../src/lib/api.js")
    await addToCart("t-001", 2)
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/cart/items",
      expect.objectContaining({ method: "POST" }),
    )
  })

  test("updateCartItem は PUT", async () => {
    const { updateCartItem } = await import("../../src/lib/api.js")
    await updateCartItem("t-001", 3)
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/cart/items/t-001",
      expect.objectContaining({ method: "PUT" }),
    )
  })

  test("removeCartItem は DELETE", async () => {
    const { removeCartItem } = await import("../../src/lib/api.js")
    await removeCartItem("t-001")
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/cart/items/t-001",
      expect.objectContaining({ method: "DELETE" }),
    )
  })

  test("createOrder は /api/orders に POST", async () => {
    const { createOrder } = await import("../../src/lib/api.js")
    await createOrder({ name: "Test", email: "t@e.st", address: "Tokyo" })
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/orders",
      expect.objectContaining({ method: "POST" }),
    )
  })

  test("全関数がハードコードされた localhost URL を使わない", async () => {
    const api = await import("../../src/lib/api.js")
    await api.fetchProducts()
    await api.fetchCart()
    await api.addToCart("x", 1)
    for (const call of mockFetch.mock.calls) {
      expect(call[0]).not.toContain("localhost")
    }
  })
})
