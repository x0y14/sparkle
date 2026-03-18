import type { DataAccessor, OHLCObject } from "../types"

export function sampleOHLC(accessor: DataAccessor, targetCount: number): OHLCObject[] {
  const count = accessor.getCount()
  if (targetCount >= count) {
    const result: OHLCObject[] = []
    for (let i = 0; i < count; i++) {
      result.push({
        time: accessor.getX(i),
        open: accessor.getOpen(i),
        high: accessor.getHigh(i),
        low: accessor.getLow(i),
        close: accessor.getClose(i),
      })
    }
    return result
  }

  const bucketSize = count / targetCount
  const result: OHLCObject[] = []

  for (let b = 0; b < targetCount; b++) {
    const start = Math.floor(b * bucketSize)
    const end = Math.min(Math.floor((b + 1) * bucketSize), count)
    let high = -Infinity, low = Infinity
    for (let i = start; i < end; i++) {
      if (accessor.getHigh(i) > high) high = accessor.getHigh(i)
      if (accessor.getLow(i) < low) low = accessor.getLow(i)
    }
    result.push({
      time: accessor.getX(start),
      open: accessor.getOpen(start),
      high,
      low,
      close: accessor.getClose(end - 1),
    })
  }
  return result
}
