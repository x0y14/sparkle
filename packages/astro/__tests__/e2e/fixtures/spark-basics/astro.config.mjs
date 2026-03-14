import { defineConfig } from "astro/config";
import { sparkleIntegration } from "@sparkle/astro";

export default defineConfig({
  integrations: [sparkleIntegration()],
});
