import type { HandleSide } from "../types"

export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

export function containsPoint(rect: Rect, px: number, py: number): boolean {
  return px >= rect.x && px <= rect.x + rect.width && py >= rect.y && py <= rect.y + rect.height
}

export function computeHandles(rect: Rect, handleSize: number): Array<{ side: HandleSide; cx: number; cy: number }> {
  return [
    { side: "top", cx: rect.x + rect.width / 2, cy: rect.y },
    { side: "right", cx: rect.x + rect.width, cy: rect.y + rect.height / 2 },
    { side: "bottom", cx: rect.x + rect.width / 2, cy: rect.y + rect.height },
    { side: "left", cx: rect.x, cy: rect.y + rect.height / 2 },
  ]
}

export function handleContainsPoint(cx: number, cy: number, size: number, px: number, py: number): boolean {
  return px >= cx - size / 2 && px <= cx + size / 2 && py >= cy - size / 2 && py <= cy + size / 2
}
