import { describe, test, expect, beforeEach } from "vitest";
import { app } from "../src/index.js";
import { resetStore } from "../src/store.js";

const headers = { "x-session-id": "test-session-1", "Content-Type": "application/json" };

async function addToCart(productId: string, quantity: number) {
  await app.request("/api/cart/items", { method: "POST", headers, body: JSON.stringify({ productId, quantity }) });
}

describe("Orders API", () => {
  beforeEach(() => resetStore());

  test("注文作成 → 201", async () => {
    await addToCart("san-001", 2);
    const res = await app.request("/api/orders", {
      method: "POST", headers,
      body: JSON.stringify({ name: "田中太郎", email: "tanaka@example.com", address: "東京都渋谷区1-1-1" }),
    });
    expect(res.status).toBe(201);
    const order = await res.json();
    expect(order.items).toHaveLength(1);
    expect(order.items[0].product.name).toBe("EVAクロッグサンダル");
    expect(order.total).toBe(3900 * 2);
    expect(order.customer.name).toBe("田中太郎");
    expect(order.id).toMatch(/^order-/);
  });

  test("複数商品注文の合計", async () => {
    await addToCart("san-001", 1);
    await addToCart("lea-001", 2);
    const res = await app.request("/api/orders", {
      method: "POST", headers,
      body: JSON.stringify({ name: "T", email: "t@t.com", address: "a" }),
    });
    const order = await res.json();
    expect(order.total).toBe(3900 + 18900 * 2);
  });

  test("注文後カートクリア", async () => {
    await addToCart("san-001", 1);
    await app.request("/api/orders", {
      method: "POST", headers,
      body: JSON.stringify({ name: "T", email: "t@t.com", address: "a" }),
    });
    const cartRes = await app.request("/api/cart", { headers: { "x-session-id": "test-session-1" } });
    expect((await cartRes.json()).items).toHaveLength(0);
  });

  test("空カート注文は 400", async () => {
    const res = await app.request("/api/orders", {
      method: "POST", headers,
      body: JSON.stringify({ name: "T", email: "t@t.com", address: "a" }),
    });
    expect(res.status).toBe(400);
  });

  test("必須フィールド不足は 400", async () => {
    await addToCart("san-001", 1);
    const res = await app.request("/api/orders", {
      method: "POST", headers, body: JSON.stringify({ name: "T" }),
    });
    expect(res.status).toBe(400);
  });

  test("注文IDで取得", async () => {
    await addToCart("san-001", 1);
    const r = await app.request("/api/orders", {
      method: "POST", headers,
      body: JSON.stringify({ name: "T", email: "t@t.com", address: "a" }),
    });
    const order = await r.json();
    const getRes = await app.request(`/api/orders/${order.id}`, { headers });
    expect(getRes.status).toBe(200);
    expect((await getRes.json()).id).toBe(order.id);
  });

  test("存在しない注文は 404", async () => {
    const res = await app.request("/api/orders/nonexistent", { headers });
    expect(res.status).toBe(404);
  });
});
