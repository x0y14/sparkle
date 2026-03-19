import { defineConfig, presetWind4 } from "unocss"

export default defineConfig({
  presets: [presetWind4()],
  theme: {
    colors: {
      surface: "#2d2d44",
      border: "#3a3a5c",
      canvas: "#1a1a2e",
      accent: "#8b8bff",
      muted: "#aaa",
      "muted-dim": "#888",
    },
  },
})
