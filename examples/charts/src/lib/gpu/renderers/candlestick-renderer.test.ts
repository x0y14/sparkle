import { describe, it, expect } from "vitest"
import { CandlestickRenderer, computeCandlestickBars } from "./candlestick-renderer"
import { createMockGPUDevice, makeNormalizedOHLCSeries } from "../../test-helpers"
import { createLinearScale } from "../../scales/linear-scale"

describe("computeCandlestickBars", () => {
  it("上昇バー: open < close → upColor", () => {
    const series = makeNormalizedOHLCSeries([
      { time: 0, open: 100, high: 110, low: 95, close: 105 },
    ])
    const scaleX = createLinearScale(0, 0, -1, 1)
    const scaleY = createLinearScale(95, 110, -1, 1)
    const bars = computeCandlestickBars(series, scaleX, scaleY, 0.6, [0, 0.7, 0], [0.8, 0, 0])
    expect(bars[0].colorUp[0]).toBeCloseTo(0)
    expect(bars[0].colorUp[1]).toBeCloseTo(0.7)
  })

  it("下降バー: open > close → downColor", () => {
    const series = makeNormalizedOHLCSeries([
      { time: 0, open: 105, high: 110, low: 95, close: 100 },
    ])
    const scaleX = createLinearScale(0, 0, -1, 1)
    const scaleY = createLinearScale(95, 110, -1, 1)
    const bars = computeCandlestickBars(series, scaleX, scaleY, 0.6, [0, 0.7, 0], [0.8, 0, 0])
    expect(bars[0].colorDown[0]).toBeCloseTo(0.8)
  })

  it("OHLC データが正しく読み取られる", () => {
    const series = makeNormalizedOHLCSeries([
      { time: 0, open: 100, high: 110, low: 90, close: 105 },
    ])
    const scaleX = createLinearScale(0, 0, -1, 1)
    const scaleY = createLinearScale(90, 110, -1, 1)
    const bars = computeCandlestickBars(series, scaleX, scaleY, 0.6, [0, 0.7, 0], [0.8, 0, 0])
    expect(bars).toHaveLength(1)
  })
})

describe("CandlestickRenderer", () => {
  const gpu = createMockGPUDevice()

  it("draw(18, barCount) を呼ぶ", () => {
    const series = makeNormalizedOHLCSeries([
      { time: 0, open: 100, high: 110, low: 95, close: 105 },
      { time: 1, open: 105, high: 115, low: 100, close: 110 },
    ])
    const renderer = new CandlestickRenderer(gpu, 4)
    renderer.prepare(gpu, [series], {
      transformMatrix: new Float32Array(16),
      canvasWidth: 800, canvasHeight: 600,
    })

    const encoder = gpu.device.createCommandEncoder()
    const drawCalls: { vertexCount: number; instanceCount: number }[] = []
    const origBeginRenderPass = encoder.beginRenderPass.bind(encoder)
    encoder.beginRenderPass = (desc: GPURenderPassDescriptor) => {
      const pass = origBeginRenderPass(desc)
      const origDraw = pass.draw.bind(pass)
      pass.draw = (v: number, i: number) => {
        drawCalls.push({ vertexCount: v, instanceCount: i })
        origDraw(v, i)
      }
      return pass
    }

    renderer.render(encoder, {} as GPUTextureView, {} as GPUTextureView)
    expect(drawCalls).toEqual([{ vertexCount: 18, instanceCount: 2 }])
  })
})
