import { defineConfig } from "astro/config"
import { sparkioIntegration } from "@sparkio/astro"

export default defineConfig({
  integrations: [sparkioIntegration()],
})
