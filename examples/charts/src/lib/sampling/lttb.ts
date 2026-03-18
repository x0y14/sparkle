import type { DataAccessor } from "../types"

export function lttb(accessor: DataAccessor, targetCount: number): number[] {
  const count = accessor.getCount()
  if (targetCount >= count || targetCount < 3) {
    const indices: number[] = []
    for (let i = 0; i < count; i++) indices.push(i)
    return indices
  }

  const result: number[] = [0]
  const bucketSize = (count - 2) / (targetCount - 2)

  let prevSelected = 0
  for (let b = 0; b < targetCount - 2; b++) {
    const bucketStart = Math.floor(1 + b * bucketSize)
    const bucketEnd = Math.min(Math.floor(1 + (b + 1) * bucketSize), count - 1)

    const nextBucketStart = Math.floor(1 + (b + 1) * bucketSize)
    const nextBucketEnd = Math.min(Math.floor(1 + (b + 2) * bucketSize), count - 1)
    let avgX = 0, avgY = 0, avgCount = 0
    for (let i = nextBucketStart; i < nextBucketEnd; i++) {
      avgX += accessor.getX(i)
      avgY += accessor.getY(i)
      avgCount++
    }
    if (avgCount === 0) { avgX = accessor.getX(count - 1); avgY = accessor.getY(count - 1); avgCount = 1 }
    avgX /= avgCount
    avgY /= avgCount

    const ax = accessor.getX(prevSelected)
    const ay = accessor.getY(prevSelected)
    let maxArea = -1
    let bestIndex = bucketStart

    for (let i = bucketStart; i < bucketEnd; i++) {
      const bx = accessor.getX(i)
      const by = accessor.getY(i)
      const area = Math.abs((ax - avgX) * (by - ay) - (ax - bx) * (avgY - ay)) * 0.5
      if (area > maxArea) { maxArea = area; bestIndex = i }
    }

    result.push(bestIndex)
    prevSelected = bestIndex
  }

  result.push(count - 1)
  return result
}
