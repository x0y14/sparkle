import type { Figure } from "../types"
import { snap } from "./snap"

export interface DragState {
  figureId: string
  startMouseX: number
  startMouseY: number
  startFigureX: number
  startFigureY: number
}

export function beginDrag(figure: Figure, mouseX: number, mouseY: number): DragState {
  return {
    figureId: figure.id,
    startMouseX: mouseX,
    startMouseY: mouseY,
    startFigureX: figure.x,
    startFigureY: figure.y,
  }
}

export function moveDrag(state: DragState, mouseX: number, mouseY: number): { x: number; y: number } {
  const dx = mouseX - state.startMouseX
  const dy = mouseY - state.startMouseY
  return {
    x: snap(state.startFigureX + dx),
    y: snap(state.startFigureY + dy),
  }
}
