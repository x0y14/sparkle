export type FigureId = string

export type HandleSide = "top" | "right" | "bottom" | "left"

export interface Figure {
  id: FigureId
  kind: "rect"
  x: number
  y: number
  width: number
  height: number
  fill: [number, number, number, number]  // RGBA 0-1
}

export interface GPUContext {
  device: GPUDevice
  context: GPUCanvasContext
  format: GPUTextureFormat
}

export type HitTarget =
  | { kind: "figure"; figureId: FigureId }
  | { kind: "handle"; figureId: FigureId; side: HandleSide }
  | { kind: "canvas" }
