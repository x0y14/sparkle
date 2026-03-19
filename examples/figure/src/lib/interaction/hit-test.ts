import type { Figure, HitTarget } from "../types"
import { containsPoint, computeHandles, handleContainsPoint } from "../geometry/rect"

export const HANDLE_SIZE = 8

export function hitTest(figures: Figure[], selectedId: string | null, px: number, py: number): HitTarget {
  if (selectedId !== null) {
    const selected = figures.find(f => f.id === selectedId)
    if (selected) {
      const handles = computeHandles(selected, HANDLE_SIZE)
      for (const handle of handles) {
        if (handleContainsPoint(handle.cx, handle.cy, HANDLE_SIZE, px, py)) {
          return { kind: "handle", figureId: selectedId, side: handle.side }
        }
      }
    }
  }

  for (let i = figures.length - 1; i >= 0; i--) {
    const fig = figures[i]
    if (containsPoint(fig, px, py)) {
      return { kind: "figure", figureId: fig.id }
    }
  }

  return { kind: "canvas" }
}
