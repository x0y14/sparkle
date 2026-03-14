import { defineConfig } from "astro/config"
import node from "@astrojs/node"
import { blaskIntegration } from "@blask/astro"
import UnoCSS from "@unocss/astro"
import unoConfig from "./uno.config.ts"
export default defineConfig({
  output: "server",
  adapter: node({ mode: "standalone" }),
  integrations: [blaskIntegration({ unoConfig }), UnoCSS({ injectReset: true })],
  server: { port: 4321 },
  vite: {
    server: {
      proxy: {
        "/api": "http://localhost:3001",
      },
    },
  },
})
