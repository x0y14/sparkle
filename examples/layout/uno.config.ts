import { defineConfig } from "unocss"
import presetWind4 from "@unocss/preset-wind4"
import presetTypography from "@unocss/preset-typography"

export default defineConfig({
  safelist: [
    // renderLayoutNode で動的に使用するクラス
    "flex", "flex-row", "flex-col",
    "items-center", "justify-center",
    "gap-2", "p-2", "p-4",
    "border-2", "border-blue-300", "border-gray-300",
    "bg-blue-50", "bg-gray-50",
    "rounded", "text-sm", "font-mono", "flex-1",
    // ドラッグ用
    "cursor-grab",
    // ツールボックス用
    "shadow-lg", "rounded-lg", "z-50",
    "px-3", "py-2", "select-none",
    "hover:bg-gray-100",
    "absolute", "relative", "top-2", "right-2", "bottom-2",
    // インスペクター用
    "border", "border-gray-300", "py-1", "p-3",
  ],
  presets: [presetWind4(), presetTypography()],
})
