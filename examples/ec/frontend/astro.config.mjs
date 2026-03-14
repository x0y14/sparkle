import { defineConfig } from "astro/config"
import node from "@astrojs/node"
import { sparkioIntegration } from "@sparkio/astro"
import UnoCSS from "@unocss/astro"
import unoConfig from "./uno.config.ts"
export default defineConfig({
  output: "server",
  adapter: node({ mode: "standalone" }),
  integrations: [sparkioIntegration({ unoConfig }), UnoCSS({ injectReset: true })],
  server: { port: 4321 },
  vite: {
    server: {
      proxy: {
        "/api": "http://localhost:3001",
      },
    },
  },
})
