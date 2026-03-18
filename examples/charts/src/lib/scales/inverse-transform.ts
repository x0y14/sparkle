import type { PlotRect } from "../types"

export function cssPixelToData(
  cssX: number, cssY: number,
  plotRect: PlotRect,
  domainMinX: number, domainMaxX: number,
  domainMinY: number, domainMaxY: number,
): { dataX: number; dataY: number } {
  const tX = (cssX - plotRect.x) / plotRect.width
  const tY = 1 - (cssY - plotRect.y) / plotRect.height

  const dataX = domainMinX + tX * (domainMaxX - domainMinX)
  const dataY = domainMinY + tY * (domainMaxY - domainMinY)
  return { dataX, dataY }
}

export function isInsidePlotRect(cssX: number, cssY: number, plotRect: PlotRect): boolean {
  return cssX >= plotRect.x && cssX <= plotRect.x + plotRect.width
    && cssY >= plotRect.y && cssY <= plotRect.y + plotRect.height
}
