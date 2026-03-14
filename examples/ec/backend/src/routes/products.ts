import { Hono } from "hono"
import { products } from "../store.js"

const app = new Hono()

app.get("/", (c) => {
  const category = c.req.query("category")
  let list = [...products.values()]
  if (category) list = list.filter((p) => p.category === category)
  return c.json(list)
})

app.get("/:id", (c) => {
  const product = products.get(c.req.param("id"))
  if (!product) return c.json({ error: "Product not found" }, 404)
  return c.json(product)
})

export default app
