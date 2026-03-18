import { defineConfig } from "astro/config"
import { sparkioIntegration } from "@sparkio/astro"
import UnoCSS from "@unocss/astro"
import unoConfig from "./uno.config.ts"

export default defineConfig({
  integrations: [sparkioIntegration({ unoConfig }), UnoCSS({ injectReset: true })],
  server: { port: 4400 },
})
