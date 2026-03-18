import type { Margins } from "../types"

export const DEFAULT_LINE_WIDTH = 2
export const DEFAULT_BAR_WIDTH = 0.8
export const DEFAULT_POINT_RADIUS = 4
export const DEFAULT_INNER_RADIUS = 0
export const DEFAULT_OUTER_RADIUS = 1
export const DEFAULT_MARGINS: Margins = { top: 20, right: 20, bottom: 40, left: 60 }
export const DEFAULT_MSAA_SAMPLE_COUNT = 4 as const
export const DEFAULT_TICK_COUNT = 8
export const DEFAULT_FORMAT = (v: number): string => {
  if (Math.abs(v) >= 1e6) return (v / 1e6).toFixed(1) + "M"
  if (Math.abs(v) >= 1e3) return (v / 1e3).toFixed(1) + "K"
  return Number.isInteger(v) ? v.toString() : v.toFixed(2)
}
