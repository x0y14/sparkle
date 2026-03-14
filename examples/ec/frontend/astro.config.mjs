import { defineConfig } from "astro/config";
import { sparkleIntegration } from "@sparkle/astro";
import UnoCSS from "@unocss/astro";
import unoConfig from "./uno.config.ts";
export default defineConfig({
  output: 'server',
  integrations: [sparkleIntegration({ unoConfig }), UnoCSS({ injectReset: true })],
  server: { port: 4321 },
  vite: {
    server: {
      proxy: {
        '/api': 'http://localhost:3001',
      },
    },
  },
});
