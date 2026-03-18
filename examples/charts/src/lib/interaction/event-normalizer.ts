const LINE_HEIGHT = 40
const PAGE_HEIGHT = 800

export function normalizeWheelDelta(event: WheelEvent): number {
  let delta = event.deltaY
  switch (event.deltaMode) {
    case WheelEvent.DOM_DELTA_LINE: delta *= LINE_HEIGHT; break
    case WheelEvent.DOM_DELTA_PAGE: delta *= PAGE_HEIGHT; break
  }
  return Math.max(-300, Math.min(300, delta))
}

export function getPointerCSSPosition(event: PointerEvent | MouseEvent, canvas: HTMLElement): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect()
  return { x: event.clientX - rect.left, y: event.clientY - rect.top }
}
