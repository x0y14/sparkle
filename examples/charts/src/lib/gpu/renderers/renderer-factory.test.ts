import { describe, it, expect } from "vitest"
import { createRendererForType } from "./renderer-factory"
import { createMockGPUDevice } from "../../test-helpers"
import { LineRenderer } from "./line-renderer"
import { BarRenderer } from "./bar-renderer"
import { AreaRenderer } from "./area-renderer"
import { ScatterRenderer } from "./scatter-renderer"
import { PieRenderer } from "./pie-renderer"
import { CandlestickRenderer } from "./candlestick-renderer"

describe("createRendererForType", () => {
  const gpu = createMockGPUDevice()

  it("line → LineRenderer を返す", () => {
    expect(createRendererForType("line", gpu, 4)).toBeInstanceOf(LineRenderer)
  })

  it("bar → BarRenderer を返す", () => {
    expect(createRendererForType("bar", gpu, 4)).toBeInstanceOf(BarRenderer)
  })

  it("area → AreaRenderer を返す", () => {
    expect(createRendererForType("area", gpu, 4)).toBeInstanceOf(AreaRenderer)
  })

  it("scatter → ScatterRenderer を返す", () => {
    expect(createRendererForType("scatter", gpu, 4)).toBeInstanceOf(ScatterRenderer)
  })

  it("pie → PieRenderer を返す", () => {
    expect(createRendererForType("pie", gpu, 4)).toBeInstanceOf(PieRenderer)
  })

  it("candlestick → CandlestickRenderer を返す", () => {
    expect(createRendererForType("candlestick", gpu, 4)).toBeInstanceOf(CandlestickRenderer)
  })

  it("未知の type で throw", () => {
    expect(() => createRendererForType("unknown" as any, gpu, 4)).toThrow("Unsupported chart type")
  })
})
