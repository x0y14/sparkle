import type { PlotRect, Margins } from "../types"

export const DEFAULT_MARGINS: Margins = { top: 20, right: 20, bottom: 40, left: 60 }

export function computePlotRect(
  canvasWidth: number,
  canvasHeight: number,
  margins: Margins,
): PlotRect {
  const width = Math.max(0, canvasWidth - margins.left - margins.right)
  const height = Math.max(0, canvasHeight - margins.top - margins.bottom)
  return { x: margins.left, y: margins.top, width, height }
}
