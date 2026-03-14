import { Hono } from "hono";
import { sessionMiddleware } from "../middleware/session.js";
import { carts, products } from "../store.js";
import type { Cart } from "../types.js";

type Env = { Variables: { sessionId: string } };
const app = new Hono<Env>();
app.use("*", sessionMiddleware);

function getOrCreateCart(sessionId: string): Cart {
  let cart = carts.get(sessionId);
  if (!cart) { cart = { sessionId, items: [] }; carts.set(sessionId, cart); }
  return cart;
}

app.get("/", (c) => {
  const cart = getOrCreateCart(c.get("sessionId"));
  const enriched = cart.items.map((item) => ({
    ...item, product: products.get(item.productId) ?? null,
  }));
  return c.json({ sessionId: cart.sessionId, items: enriched });
});

app.post("/items", async (c) => {
  const { productId, quantity } = await c.req.json<{ productId: string; quantity: number }>();
  if (!productId || !quantity || quantity < 1)
    return c.json({ error: "productId and quantity (>= 1) are required" }, 400);
  const product = products.get(productId);
  if (!product) return c.json({ error: "Product not found" }, 404);
  if (quantity > product.stock) return c.json({ error: "Exceeds stock" }, 400);
  const cart = getOrCreateCart(c.get("sessionId"));
  const existing = cart.items.find((i) => i.productId === productId);
  if (existing) existing.quantity += quantity;
  else cart.items.push({ productId, quantity });
  return c.json(cart, 201);
});

app.put("/items/:productId", async (c) => {
  const productId = c.req.param("productId");
  const { quantity } = await c.req.json<{ quantity: number }>();
  const cart = getOrCreateCart(c.get("sessionId"));
  const item = cart.items.find((i) => i.productId === productId);
  if (!item) return c.json({ error: "Item not in cart" }, 404);
  if (quantity < 1) return c.json({ error: "Quantity must be >= 1" }, 400);
  item.quantity = quantity;
  return c.json(cart);
});

app.delete("/items/:productId", (c) => {
  const productId = c.req.param("productId");
  const cart = getOrCreateCart(c.get("sessionId"));
  cart.items = cart.items.filter((i) => i.productId !== productId);
  return c.json(cart);
});

export default app;
