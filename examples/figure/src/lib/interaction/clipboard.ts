import type { Figure } from "../types"
import { snap } from "./snap"

export interface Clipboard {
  figure: Omit<Figure, "id" | "x" | "y"> | null
}

export function createClipboard(): Clipboard {
  return { figure: null }
}

export function copyFigure(clipboard: Clipboard, figure: Figure): void {
  clipboard.figure = {
    kind: figure.kind,
    width: figure.width,
    height: figure.height,
    fill: [...figure.fill] as [number, number, number, number],
  }
}

export function pasteFigure(clipboard: Clipboard, offsetX: number, offsetY: number): Omit<Figure, "id"> | null {
  if (!clipboard.figure) return null
  return {
    kind: clipboard.figure.kind,
    x: snap(offsetX),
    y: snap(offsetY),
    width: clipboard.figure.width,
    height: clipboard.figure.height,
    fill: [...clipboard.figure.fill] as [number, number, number, number],
  }
}
