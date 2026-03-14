import { createMiddleware } from "hono/factory"
export const sessionMiddleware = createMiddleware<{
  Variables: { sessionId: string }
}>(async (c, next) => {
  const sessionId = c.req.header("x-session-id")
  if (!sessionId) return c.json({ error: "x-session-id header is required" }, 400)
  c.set("sessionId", sessionId)
  await next()
})
