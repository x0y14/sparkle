import { Hono } from "hono"
import { sessionMiddleware } from "../middleware/session.js"
import { carts, orders, products } from "../store.js"
import type { Order, OrderItem } from "../types.js"

type Env = { Variables: { sessionId: string } }
const app = new Hono<Env>()
app.use("*", sessionMiddleware)

app.post("/", async (c) => {
  const { name, email, address } = await c.req.json<{
    name: string
    email: string
    address: string
  }>()
  if (!name || !email || !address)
    return c.json({ error: "name, email, address are required" }, 400)
  const cart = carts.get(c.get("sessionId"))
  if (!cart || cart.items.length === 0) return c.json({ error: "Cart is empty" }, 400)
  const orderItems: OrderItem[] = cart.items.map((item) => ({
    ...item,
    product: products.get(item.productId)!,
  }))
  const total = orderItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
  const order: Order = {
    id: `order-${Date.now()}`,
    items: orderItems,
    total,
    customer: { name, email, address },
    createdAt: new Date().toISOString(),
  }
  orders.set(order.id, order)
  cart.items = []
  return c.json(order, 201)
})

app.get("/:id", (c) => {
  const order = orders.get(c.req.param("id"))
  if (!order) return c.json({ error: "Order not found" }, 404)
  return c.json(order)
})

export default app
