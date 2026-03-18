import { normalizeWheelDelta, getPointerCSSPosition } from "./event-normalizer"
import { ZoomState } from "../scales/zoom"
import type { PlotRect } from "../types"

const ZOOM_SENSITIVITY = 0.005

export class ZoomPanHandler {
  private zoom: ZoomState
  private plotRect: PlotRect
  private isDragging = false
  private lastPointerX = 0
  private onDirty: () => void

  constructor(zoom: ZoomState, plotRect: PlotRect, onDirty: () => void) {
    this.zoom = zoom
    this.plotRect = plotRect
    this.onDirty = onDirty
  }

  updatePlotRect(rect: PlotRect): void { this.plotRect = rect }

  handleWheel(event: WheelEvent, canvas: HTMLElement): void {
    const delta = normalizeWheelDelta(event)
    const { x } = getPointerCSSPosition(event, canvas)
    const pct = this.cssXToPercent(x)
    const factor = Math.exp(-delta * ZOOM_SENSITIVITY)
    this.zoom.zoomAt(pct, factor)
    this.onDirty()
  }

  handlePointerDown(event: PointerEvent, canvas: HTMLElement): void {
    this.isDragging = true
    const { x } = getPointerCSSPosition(event, canvas)
    this.lastPointerX = x
  }

  handlePointerMove(event: PointerEvent, canvas: HTMLElement): void {
    if (!this.isDragging) return
    const { x } = getPointerCSSPosition(event, canvas)
    const deltaPx = x - this.lastPointerX
    const span = this.zoom.endPct - this.zoom.startPct
    const deltaPct = -(deltaPx / this.plotRect.width) * span
    this.zoom.pan(deltaPct)
    this.lastPointerX = x
    this.onDirty()
  }

  handlePointerUp(): void { this.isDragging = false }

  private cssXToPercent(cssX: number): number {
    const t = (cssX - this.plotRect.x) / this.plotRect.width
    const span = this.zoom.endPct - this.zoom.startPct
    return this.zoom.startPct + t * span
  }
}
