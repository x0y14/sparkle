import type { ZoomWindow } from "../types"

export class ZoomState {
  startPct: number
  endPct: number
  private listeners: (() => void)[] = []

  constructor(start: number = 0, end: number = 100) {
    this.startPct = start
    this.endPct = end
  }

  onZoomChange(cb: () => void): () => void {
    this.listeners.push(cb)
    return () => { const i = this.listeners.indexOf(cb); if (i >= 0) this.listeners.splice(i, 1) }
  }

  private notify(): void {
    for (const cb of this.listeners) cb()
  }

  getWindow(): ZoomWindow {
    return { startPct: this.startPct, endPct: this.endPct }
  }

  zoomAt(anchorPct: number, factor: number): void {
    const span = this.endPct - this.startPct
    const newSpan = Math.max(0.01, Math.min(100, span / factor))
    const anchorRatio = (anchorPct - this.startPct) / span
    this.startPct = anchorPct - anchorRatio * newSpan
    this.endPct = this.startPct + newSpan
    this.clamp()
    this.notify()
  }

  pan(deltaPct: number): void {
    const span = this.endPct - this.startPct
    this.startPct += deltaPct
    this.endPct = this.startPct + span
    this.clamp()
    this.notify()
  }

  setWindow(startPct: number, endPct: number): void {
    this.startPct = startPct
    this.endPct = endPct
    this.clamp()
    this.notify()
  }

  toDomain(domainMin: number, domainMax: number): { visibleMin: number; visibleMax: number } {
    const span = domainMax - domainMin
    return {
      visibleMin: domainMin + (this.startPct / 100) * span,
      visibleMax: domainMin + (this.endPct / 100) * span,
    }
  }

  isAtEnd(): boolean {
    return this.endPct >= 99.99
  }

  private clamp(): void {
    const span = this.endPct - this.startPct
    if (this.startPct < 0) { this.startPct = 0; this.endPct = span }
    if (this.endPct > 100) { this.endPct = 100; this.startPct = 100 - span }
    if (this.startPct < 0) this.startPct = 0
  }
}
