import type { PlotRect } from "../types"

export function buildTransformMatrix(
  domainMinX: number, domainMaxX: number,
  domainMinY: number, domainMaxY: number,
  plotRect: PlotRect,
  canvasWidth: number, canvasHeight: number,
  offsetX: number, offsetY: number,
): Float32Array {
  const clipLeft = (plotRect.x / canvasWidth) * 2 - 1
  const clipRight = ((plotRect.x + plotRect.width) / canvasWidth) * 2 - 1
  const clipBottom = 1 - ((plotRect.y + plotRect.height) / canvasHeight) * 2
  const clipTop = 1 - (plotRect.y / canvasHeight) * 2

  const relDomMinX = domainMinX - offsetX
  const relDomMaxX = domainMaxX - offsetX
  const relDomMinY = domainMinY - offsetY
  const relDomMaxY = domainMaxY - offsetY

  const domSpanX = relDomMaxX - relDomMinX || 1
  const domSpanY = relDomMaxY - relDomMinY || 1

  const sx = (clipRight - clipLeft) / domSpanX
  const sy = (clipTop - clipBottom) / domSpanY

  const tx = clipLeft - sx * relDomMinX
  const ty = clipBottom - sy * relDomMinY

  return new Float32Array([
    sx, 0,  0, 0,
    0,  sy, 0, 0,
    0,  0,  1, 0,
    tx, ty, 0, 1,
  ])
}
