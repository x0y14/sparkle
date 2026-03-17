import { defineConfig, presetWind4, presetIcons } from "unocss"
import * as V from "./src/utils/variants"

function collectClasses(obj: Record<string, unknown>): string[] {
  const classes: string[] = []
  for (const value of Object.values(obj)) {
    if (typeof value === "string") {
      classes.push(...value.split(/\s+/))
    } else if (typeof value === "object" && value !== null) {
      classes.push(...collectClasses(value as Record<string, unknown>))
    }
  }
  return classes
}

const safelist = [...new Set(collectClasses(V as Record<string, unknown>))]

export default defineConfig({
  safelist,
  presets: [
    presetWind4(),
    presetIcons({
      collections: {
        lucide: () => import("@iconify-json/lucide/icons.json").then(i => i.default),
      },
    }),
  ],
  theme: {
    colors: {
      primary: {
        50: "#EEF2FF", 100: "#E0E7FF", 200: "#C7D2FE", 300: "#A5B4FC",
        400: "#818CF8", 500: "#6366F1", 600: "#4F46E5", 700: "#4338CA",
        800: "#3730A3", 900: "#312E81", DEFAULT: "#6366F1",
      },
      secondary: {
        50: "#F5F3FF", 100: "#EDE9FE", 200: "#DDD6FE", 300: "#C4B5FD",
        400: "#A78BFA", 500: "#8B5CF6", 600: "#7C3AED", 700: "#6D28D9",
        800: "#5B21B6", 900: "#4C1D95", DEFAULT: "#8B5CF6",
      },
      success: {
        50: "#F0FDF4", 100: "#DCFCE7", 200: "#BBF7D0", 300: "#86EFAC",
        400: "#4ADE80", 500: "#22C55E", 600: "#16A34A", 700: "#15803D",
        800: "#166534", 900: "#14532D", DEFAULT: "#22C55E",
      },
      warning: {
        50: "#FFFBEB", 100: "#FEF3C7", 200: "#FDE68A", 300: "#FCD34D",
        400: "#FBBF24", 500: "#F59E0B", 600: "#D97706", 700: "#B45309",
        800: "#92400E", 900: "#78350F", DEFAULT: "#F59E0B",
      },
      danger: {
        50: "#FEF2F2", 100: "#FEE2E2", 200: "#FECACA", 300: "#FCA5A5",
        400: "#F87171", 500: "#EF4444", 600: "#DC2626", 700: "#B91C1C",
        800: "#991B1B", 900: "#7F1D1D", DEFAULT: "#EF4444",
      },
      default: {
        50: "#FAFAFA", 100: "#F4F4F5", 200: "#E4E4E7", 300: "#D4D4D8",
        400: "#A1A1AA", 500: "#71717A", 600: "#52525B", 700: "#3F3F46",
        800: "#27272A", 900: "#18181B", DEFAULT: "#D4D4D8",
      },
      foreground: "#11181C",
      background: "#FFFFFF",
      content1: "#FFFFFF",
      content2: "#F4F4F5",
      content3: "#E4E4E7",
      content4: "#D4D4D8",
    },
  },
})
