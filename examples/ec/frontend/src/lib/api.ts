import type { Product, CartItem, Order } from "./types.js"
const BASE = "/api"
function getSessionId(): string {
  if (typeof localStorage === "undefined") return "ssr-no-session"
  let id = localStorage.getItem("ec-session-id")
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem("ec-session-id", id)
  }
  return id
}
function headers(): Record<string, string> {
  return { "x-session-id": getSessionId(), "Content-Type": "application/json" }
}
export async function fetchProducts(category?: string): Promise<Product[]> {
  const url = category ? `${BASE}/products?category=${category}` : `${BASE}/products`
  return (await fetch(url)).json()
}
export async function fetchProduct(id: string): Promise<Product> {
  const res = await fetch(`${BASE}/products/${id}`)
  if (!res.ok) throw new Error("Product not found")
  return res.json()
}
export async function fetchCart(): Promise<{ sessionId: string; items: CartItem[] }> {
  return (await fetch(`${BASE}/cart`, { headers: headers() })).json()
}
export async function addToCart(productId: string, quantity: number): Promise<void> {
  await fetch(`${BASE}/cart/items`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ productId, quantity }),
  })
}
export async function updateCartItem(productId: string, quantity: number): Promise<void> {
  await fetch(`${BASE}/cart/items/${productId}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify({ quantity }),
  })
}
export async function removeCartItem(productId: string): Promise<void> {
  await fetch(`${BASE}/cart/items/${productId}`, { method: "DELETE", headers: headers() })
}
export async function createOrder(customer: {
  name: string
  email: string
  address: string
}): Promise<Order> {
  const res = await fetch(`${BASE}/orders`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(customer),
  })
  return res.json()
}
export async function fetchOrder(id: string): Promise<Order> {
  const res = await fetch(`${BASE}/orders/${id}`, { headers: headers() })
  if (!res.ok) throw new Error("Order not found")
  return res.json()
}
