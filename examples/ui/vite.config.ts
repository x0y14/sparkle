import { defineConfig } from "vite"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig(async () => {
  const { sparkioVitePlugin } = await import(
    path.resolve(__dirname, "../../packages/vite/dist/index.js")
  )
  const { default: unoConfig } = await import("./uno.config.ts")

  return {
    plugins: [sparkioVitePlugin({ unoConfig })],
  }
})
