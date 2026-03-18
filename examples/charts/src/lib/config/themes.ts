import type { Theme } from "../types"

export const lightTheme: Theme = {
  colors: {
    background: "#FFFFFF",
    gridLine: "#E5E7EB",
    axisLine: "#9CA3AF",
    axisLabel: "#6B7280",
    crosshair: "#374151",
    tooltipBg: "#1F2937",
    tooltipText: "#FFFFFF",
    tooltipBorder: "#374151",
  },
  palette: [
    "#6366F1", "#EC4899", "#14B8A6", "#F59E0B",
    "#8B5CF6", "#EF4444", "#06B6D4", "#84CC16",
    "#F97316", "#3B82F6",
  ],
  fontFamily: "system-ui, -apple-system, sans-serif",
  fontSize: { label: 11, title: 14, tooltip: 12 },
}

export const darkTheme: Theme = {
  colors: {
    background: "#111827",
    gridLine: "#374151",
    axisLine: "#6B7280",
    axisLabel: "#9CA3AF",
    crosshair: "#D1D5DB",
    tooltipBg: "#F9FAFB",
    tooltipText: "#111827",
    tooltipBorder: "#D1D5DB",
  },
  palette: [
    "#818CF8", "#F472B6", "#2DD4BF", "#FBBF24",
    "#A78BFA", "#F87171", "#22D3EE", "#A3E635",
    "#FB923C", "#60A5FA",
  ],
  fontFamily: "system-ui, -apple-system, sans-serif",
  fontSize: { label: 11, title: 14, tooltip: 12 },
}

export function resolveTheme(input: "light" | "dark" | Theme | undefined): Theme {
  if (!input || input === "light") return lightTheme
  if (input === "dark") return darkTheme
  return input
}
