import { describe, it, expect } from "vitest"
import { PieRenderer, computeSlices } from "./pie-renderer"
import { createMockGPUDevice, makeNormalizedPieSeries } from "../../test-helpers"

describe("computeSlices", () => {
  it("5シリーズ → 5スライス、角度の合計 = 2π", () => {
    const series = makeNormalizedPieSeries([35, 25, 20, 15, 5])
    const slices = computeSlices(series)
    expect(slices).toHaveLength(5)
    const totalAngle = slices.reduce((sum, s) => sum + (s.endAngle - s.startAngle), 0)
    expect(totalAngle).toBeCloseTo(Math.PI * 2, 5)
  })

  it("最初のスライスは -π/2 から開始（12時位置）", () => {
    const series = makeNormalizedPieSeries([50, 50])
    const slices = computeSlices(series)
    expect(slices[0].startAngle).toBeCloseTo(-Math.PI / 2, 5)
  })

  it("innerRadius > 0 でドーナツ", () => {
    const series = makeNormalizedPieSeries([50, 50], 0.5)
    const slices = computeSlices(series)
    expect(slices[0].innerRadius).toBe(0.5)
  })
})

describe("PieRenderer", () => {
  const gpu = createMockGPUDevice()

  it("draw(6, sliceCount) を呼ぶ", () => {
    const series = makeNormalizedPieSeries([35, 25, 20, 15, 5])
    const renderer = new PieRenderer(gpu, 4)
    renderer.prepare(gpu, series, {
      transformMatrix: new Float32Array(16),
      canvasWidth: 400, canvasHeight: 400,
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
    expect(drawCalls).toEqual([{ vertexCount: 6, instanceCount: 5 }])
  })
})
