import type { ChartType, GPUContext } from "../../types"
import type { ChartRenderer } from "./base-renderer"
import { LineRenderer } from "./line-renderer"
import { BarRenderer } from "./bar-renderer"
import { AreaRenderer } from "./area-renderer"
import { ScatterRenderer } from "./scatter-renderer"
import { PieRenderer } from "./pie-renderer"
import { CandlestickRenderer } from "./candlestick-renderer"

export function createRendererForType(
  type: ChartType,
  gpu: GPUContext,
  sampleCount: number,
): ChartRenderer {
  switch (type) {
    case "line": return new LineRenderer(gpu, sampleCount)
    case "bar": return new BarRenderer(gpu, sampleCount)
    case "area": return new AreaRenderer(gpu, sampleCount)
    case "scatter": return new ScatterRenderer(gpu, sampleCount)
    case "pie": return new PieRenderer(gpu, sampleCount)
    case "candlestick": return new CandlestickRenderer(gpu, sampleCount)
    default: throw new Error(`Unsupported chart type: ${type}`)
  }
}
