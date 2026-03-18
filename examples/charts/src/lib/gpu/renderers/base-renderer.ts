import type { GPUContext, NormalizedSeries, PlotRect } from "../../types"

export interface RenderUniforms {
  transformMatrix: Float32Array
  canvasWidth: number
  canvasHeight: number
}

export interface ChartRenderer {
  prepare(gpu: GPUContext, series: NormalizedSeries[], uniforms: RenderUniforms): void
  render(encoder: GPUCommandEncoder, targetView: GPUTextureView, msaaView?: GPUTextureView): void
  destroy(): void
}
