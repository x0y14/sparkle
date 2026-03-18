import type { NormalizedSeries, SeriesData, PointObject } from "../types"
import { createAccessor } from "./accessor"
import { computeOffset } from "./float32-offset"

export function appendSeriesData(series: NormalizedSeries, newData: SeriesData): NormalizedSeries {
  // Merge existing + new data (PointObject[] case)
  const existingData = series.data as PointObject[]
  const appendData = newData as PointObject[]
  const merged = [...existingData, ...appendData]

  const accessor = createAccessor(merged)
  const rawBoundsX = accessor.getBoundsX()
  const rawBoundsY = accessor.getBoundsY()

  const xValues: number[] = []
  for (let j = 0; j < accessor.getCount(); j++) xValues.push(accessor.getX(j))
  const offsetX = computeOffset(xValues)
  const yValues: number[] = []
  for (let j = 0; j < accessor.getCount(); j++) yValues.push(accessor.getY(j))
  const offsetY = computeOffset(yValues)

  return {
    ...series,
    data: merged,
    accessor,
    rawBoundsX,
    rawBoundsY,
    offsetX,
    offsetY,
  }
}
