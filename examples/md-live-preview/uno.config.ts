import { defineConfig } from "unocss"
import presetWind4 from "@unocss/preset-wind4"
import presetTypography from "@unocss/preset-typography"

export default defineConfig({
  presets: [presetWind4(), presetTypography()],
})
