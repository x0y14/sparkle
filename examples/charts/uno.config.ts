import { defineConfig, presetWind4 } from "unocss"

export default defineConfig({
  presets: [presetWind4()],
  theme: {
    colors: {
      surface: { DEFAULT: "#FFFFFF", dark: "#0F172A" },
      ink: { DEFAULT: "#1E293B", muted: "#64748B", faint: "#94A3B8" },
      border: { DEFAULT: "#E2E8F0" },
    },
  },
})
