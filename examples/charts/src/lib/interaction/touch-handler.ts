const TAP_MAX_DISTANCE = 10
const TAP_MAX_DURATION = 300

export type GestureType = "tap" | "pan" | "pinch"
export type GestureEvent = {
  type: GestureType
  x: number; y: number
  deltaX?: number; deltaY?: number
  scale?: number
  anchorX?: number; anchorY?: number
}

export class TouchHandler {
  private startX = 0
  private startY = 0
  private startTime = 0
  private onGesture: (e: GestureEvent) => void

  constructor(onGesture: (e: GestureEvent) => void) {
    this.onGesture = onGesture
  }

  handlePointerDown(x: number, y: number): void {
    this.startX = x; this.startY = y; this.startTime = Date.now()
  }

  handlePointerUp(x: number, y: number): void {
    const dx = x - this.startX, dy = y - this.startY
    const dist = Math.sqrt(dx * dx + dy * dy)
    const duration = Date.now() - this.startTime
    if (dist <= TAP_MAX_DISTANCE && duration <= TAP_MAX_DURATION) {
      this.onGesture({ type: "tap", x, y })
    }
  }
}
