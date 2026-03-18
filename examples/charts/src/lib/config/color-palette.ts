import type { SeriesConfig } from "../types"

export function assignColors(seriesConfigs: SeriesConfig[], palette: string[]): string[] {
  return seriesConfigs.map((s, i) => s.color ?? palette[i % palette.length])
}
