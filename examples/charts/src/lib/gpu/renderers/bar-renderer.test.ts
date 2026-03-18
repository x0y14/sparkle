import { describe, it, expect } from "vitest"
import { BarRenderer, computeBarLayout } from "./bar-renderer"
import { createMockGPUDevice, makeNormalizedSeries } from "../../test-helpers"
import { createLinearScale } from "../../scales/linear-scale"

describe("computeBarLayout", () => {
  it("クラスタリング: 2シリーズ2カテゴリ → 4矩形", () => {
    const series = makeNormalizedSeries([
      { data: [{ x: 0, y: 30 }, { x: 1, y: 50 }], label: "A" },
      { data: [{ x: 0, y: 40 }, { x: 1, y: 35 }], label: "B" },
    ], "bar")
    const scaleX = createLinearScale(-0.5, 1.5, -1, 1)
    const scaleY = createLinearScale(0, 55, -1, 1)
    const rects = computeBarLayout(series, scaleX, scaleY)
    expect(rects).toHaveLength(4)
    // Series A bar[0] should be left of series B bar[0]
    expect(rects[0].clipX).toBeLessThan(rects[2].clipX)
  })

  it("スタッキング: 同一 stackId → 累積 y", () => {
    const series = makeNormalizedSeries([
      { data: [{ x: 0, y: 30 }], label: "A", stackId: "s1" },
      { data: [{ x: 0, y: 20 }], label: "B", stackId: "s1" },
    ], "bar")
    const scaleX = createLinearScale(-0.5, 0.5, -1, 1)
    const scaleY = createLinearScale(0, 50, -1, 1)
    const rects = computeBarLayout(series, scaleX, scaleY)
    expect(rects).toHaveLength(2)
    // B's bottom should be at A's top
    const aTop = rects[0].clipY + rects[0].clipHeight
    expect(rects[1].clipY).toBeCloseTo(aTop, 5)
  })
})

describe("BarRenderer", () => {
  const gpu = createMockGPUDevice()

  it("prepare + render が例外なく完了する", () => {
    const renderer = new BarRenderer(gpu, 4)
    const series = makeNormalizedSeries([
      { data: [{ x: 0, y: 30 }, { x: 1, y: 50 }], label: "A" },
    ], "bar")
    renderer.prepare(gpu, series, {
      transformMatrix: new Float32Array(16),
      canvasWidth: 800, canvasHeight: 600,
    })
    const encoder = gpu.device.createCommandEncoder()
    renderer.render(encoder, {} as GPUTextureView, {} as GPUTextureView)
  })

  it("draw(6, barCount) を呼ぶ", () => {
    const renderer = new BarRenderer(gpu, 4)
    const series = makeNormalizedSeries([
      { data: [{ x: 0, y: 30 }, { x: 1, y: 50 }], label: "A" },
      { data: [{ x: 0, y: 40 }, { x: 1, y: 35 }], label: "B" },
    ], "bar")
    renderer.prepare(gpu, series, {
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
    expect(drawCalls).toEqual([{ vertexCount: 6, instanceCount: 4 }])
  })
})
