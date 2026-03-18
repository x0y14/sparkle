import type { DataAccessor, PlotRect } from "../types"

export function hitTestBinarySearch(
  dataX: number,
  dataY: number,
  accessor: DataAccessor,
  maxDistancePx: number,
  plotRect: PlotRect,
  domainMinX: number, domainMaxX: number,
  domainMinY: number, domainMaxY: number,
): number | null {
  const count = accessor.getCount()
  if (count === 0) return null

  let lo = 0, hi = count - 1
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (accessor.getX(mid) < dataX) lo = mid + 1
    else hi = mid
  }

  let bestIndex = -1
  let bestDist = Infinity
  for (let i = Math.max(0, lo - 1); i <= Math.min(count - 1, lo + 1); i++) {
    if (accessor.hasNull(i)) continue
    const dx = (accessor.getX(i) - dataX) / (domainMaxX - domainMinX) * plotRect.width
    const dy = (accessor.getY(i) - dataY) / (domainMaxY - domainMinY) * plotRect.height
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist < bestDist) { bestDist = dist; bestIndex = i }
  }

  if (bestIndex >= 0 && bestDist <= maxDistancePx) return bestIndex
  return null
}

export function hitTestBar(
  cssX: number, cssY: number,
  barRects: { x: number; y: number; width: number; height: number }[],
): number | null {
  for (let i = 0; i < barRects.length; i++) {
    const r = barRects[i]
    if (cssX >= r.x && cssX <= r.x + r.width && cssY >= r.y && cssY <= r.y + r.height) return i
  }
  return null
}

export function hitTestPie(
  cssX: number, cssY: number,
  centerX: number, centerY: number,
  slices: { startAngle: number; endAngle: number; innerRadius: number; outerRadius: number }[],
): number | null {
  const dx = cssX - centerX
  const dy = cssY - centerY
  const dist = Math.sqrt(dx * dx + dy * dy)
  let angle = Math.atan2(dy, dx)
  if (angle < 0) angle += 2 * Math.PI

  for (let i = 0; i < slices.length; i++) {
    const s = slices[i]
    if (dist >= s.innerRadius && dist <= s.outerRadius && angle >= s.startAngle && angle <= s.endAngle) {
      return i
    }
  }
  return null
}
