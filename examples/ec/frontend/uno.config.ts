import { defineConfig, presetWebFonts, presetWind4 } from "unocss";
export default defineConfig({
  presets: [
    presetWind4(),
    presetWebFonts({
      fonts: {
        sans: "Outfit:300,400,500,600",
        display: "Cormorant Garamond:300,400,500,600,700",
      },
    }),
  ],
  theme: {
    colors: {
      surface: {
        DEFAULT: "#FAF8F5",
        warm: "#F5F0EB",
        card: "#FFFFFF",
      },
      ink: {
        DEFAULT: "#1A1715",
        muted: "#78716C",
        faint: "#A8A29E",
      },
      accent: {
        DEFAULT: "#292524",
        hover: "#44403C",
        success: "#365314",
        error: "#991B1B",
      },
      border: {
        DEFAULT: "#E7E5E4",
        dark: "#D6D3D1",
      },
    },
  },
});
