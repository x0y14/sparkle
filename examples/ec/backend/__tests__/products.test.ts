import { describe, test, expect, beforeEach } from "vitest"
import { app } from "../src/index.js"
import { resetStore } from "../src/store.js"

describe("GET /api/products", () => {
  beforeEach(() => resetStore())

  test("全商品を返す (20件)", async () => {
    const res = await app.request("/api/products")
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toHaveLength(20)
  })

  test("category=sandals で5件", async () => {
    const res = await app.request("/api/products?category=sandals")
    const data = await res.json()
    expect(data).toHaveLength(5)
    expect(data.every((p: any) => p.category === "sandals")).toBe(true)
  })

  test("各商品に必須フィールドが含まれる", async () => {
    const res = await app.request("/api/products")
    const [first] = await res.json()
    for (const key of ["id", "name", "price", "description", "image", "category", "stock"]) {
      expect(first).toHaveProperty(key)
    }
  })

  test("存在しないカテゴリは空配列", async () => {
    const res = await app.request("/api/products?category=nonexistent")
    const data = await res.json()
    expect(data).toHaveLength(0)
  })

  test("sandals商品の image は /images/flipflop-001.webp", async () => {
    const res = await app.request("/api/products?category=sandals")
    const data = await res.json()
    expect(data.every((p: any) => p.image === "/images/flipflop-001.webp")).toBe(true)
  })

  test("全カテゴリの商品画像がカテゴリ別パスを持つ", async () => {
    const expected: Record<string, string> = {
      sandals: "/images/flipflop-001.webp",
      leather: "/images/leather-001.webp",
      sneakers: "/images/sneaker-001.webp",
      sport: "/images/sport-001.webp",
    }
    for (const [cat, img] of Object.entries(expected)) {
      const res = await app.request(`/api/products?category=${cat}`)
      const data = await res.json()
      expect(data.length).toBeGreaterThan(0)
      expect(data.every((p: any) => p.image === img)).toBe(true)
    }
  })
})

describe("GET /api/products/:id", () => {
  beforeEach(() => resetStore())

  test("ID で商品取得", async () => {
    const res = await app.request("/api/products/san-001")
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.id).toBe("san-001")
    expect(data.name).toBe("EVAクロッグサンダル")
    expect(data.price).toBe(3900)
  })

  test("存在しない ID は 404", async () => {
    const res = await app.request("/api/products/nonexistent")
    expect(res.status).toBe(404)
    const data = await res.json()
    expect(data).toHaveProperty("error")
  })
})
