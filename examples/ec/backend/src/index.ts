import { Hono } from "hono"
import { cors } from "hono/cors"
import { serve } from "@hono/node-server"
import productsRoute from "./routes/products.js"
import cartRoute from "./routes/cart.js"
import ordersRoute from "./routes/orders.js"

const app = new Hono()
app.use("/api/*", cors({ origin: "http://localhost:4321", credentials: true }))
app.route("/api/products", productsRoute)
app.route("/api/cart", cartRoute)
app.route("/api/orders", ordersRoute)

export { app }

const isDirectRun = process.argv[1]?.endsWith("index.ts") || process.argv[1]?.endsWith("index.js")
if (isDirectRun) {
  serve({ fetch: app.fetch, port: 3001 }, (info) => {
    console.log(`EC Backend running on http://localhost:${info.port}`)
  })
}
