import type { ZoomWindow } from "../types"

export class ZoomState {
  startPct: number
  endPct: number

  constructor(start: number = 0, end: number = 100) {
    this.startPct = start
    this.endPct = end
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
  }

  pan(deltaPct: number): void {
    const span = this.endPct - this.startPct
    this.startPct += deltaPct
    this.endPct = this.startPct + span
    this.clamp()
  }

  setWindow(startPct: number, endPct: number): void {
    this.startPct = startPct
    this.endPct = endPct
    this.clamp()
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
