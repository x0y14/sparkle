import type { GPUContext } from "../../types"

export interface FigureRenderer {
  prepare(gpu: GPUContext, data: Float32Array, canvasWidth: number, canvasHeight: number): void
  render(encoder: GPUCommandEncoder, targetView: GPUTextureView, msaaView?: GPUTextureView): void
  destroy(): void
}
