import { describe, it, expect } from "vitest"
import { BarRenderer, computeBarLayout } from "./bar-renderer"
import { createMockGPUDevice, makeNormalizedSeries } from "../../test-helpers"

describe("computeBarLayout", () => {
  it("クラスタリング: 2シリーズ2カテゴリ → 4矩形", () => {
    const series = makeNormalizedSeries([
      { data: [{ x: 0, y: 30 }, { x: 1, y: 50 }], label: "A" },
      { data: [{ x: 0, y: 40 }, { x: 1, y: 35 }], label: "B" },
    ], "bar")
    const rects = computeBarLayout(series)
    expect(rects).toHaveLength(4)
    // Series A bar[0] should be left of series B bar[0] (data-space X)
    expect(rects[0].dataX).toBeLessThan(rects[2].dataX)
  })

  it("スタッキング: 同一 stackId → 累積 y", () => {
    const series = makeNormalizedSeries([
      { data: [{ x: 0, y: 30 }], label: "A", stackId: "s1" },
      { data: [{ x: 0, y: 20 }], label: "B", stackId: "s1" },
    ], "bar")
    const rects = computeBarLayout(series)
    expect(rects).toHaveLength(2)
    // B's bottom should be at A's top (data space: A is [0,30], B is [30,50])
    const aTop = rects[0].dataY + rects[0].dataHeight
    expect(rects[1].dataY).toBeCloseTo(aTop, 5)
  })

  it("負の y 値を正しく処理する", () => {
    const series = makeNormalizedSeries([
      { data: [{ x: 0, y: -5 }], label: "A" },
    ], "bar")
    const rects = computeBarLayout(series)
    expect(rects).toHaveLength(1)
    // Bar should span from -5 to 0 (baseline)
    expect(rects[0].dataY).toBeCloseTo(-5)
    expect(rects[0].dataHeight).toBeCloseTo(5)
  })

  it("スタッキングで正負を分離する", () => {
    const series = makeNormalizedSeries([
      { data: [{ x: 0, y: 3 }], label: "A", stackId: "s1" },
      { data: [{ x: 0, y: -2 }], label: "B", stackId: "s1" },
    ], "bar")
    const rects = computeBarLayout(series)
    expect(rects).toHaveLength(2)
    // Positive accumulation: A=[0,3], Negative: B=[-2,0]
    expect(rects[0].dataY).toBeCloseTo(0)
    expect(rects[0].dataHeight).toBeCloseTo(3)
    expect(rects[1].dataY).toBeCloseTo(-2)
    expect(rects[1].dataHeight).toBeCloseTo(2)
  })

  it("空のシリーズで prepare がエラーにならない", () => {
    const gpu = createMockGPUDevice()
    const renderer = new BarRenderer(gpu, 4)
    renderer.prepare(gpu, [], {
      transformMatrix: new Float32Array(16),
      canvasWidth: 800, canvasHeight: 600,
    })
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

  it("prepare が uniforms.transformMatrix を使用する", () => {
    const gpu = createMockGPUDevice()
    const writeCalls: { offset: number; data: BufferSource }[] = []
    const origWriteBuffer = gpu.device.queue.writeBuffer.bind(gpu.device.queue)
    gpu.device.queue.writeBuffer = (buf: GPUBuffer, offset: number, data: BufferSource) => {
      writeCalls.push({ offset, data })
      origWriteBuffer(buf, offset, data)
    }

    const renderer = new BarRenderer(gpu, 4)
    const series = makeNormalizedSeries([
      { data: [{ x: 0, y: 30 }], label: "A" },
    ], "bar")
    const tm = new Float32Array(16)
    tm[0] = 2; tm[5] = 3; tm[10] = 1; tm[15] = 1
    renderer.prepare(gpu, series, {
      transformMatrix: tm,
      canvasWidth: 800, canvasHeight: 600,
    })
    // The uniform buffer write (second writeBuffer call) should contain our transform
    const uniformWrite = writeCalls[writeCalls.length - 1]
    const uniformData = new Float32Array((uniformWrite.data as ArrayBuffer).slice
      ? (uniformWrite.data as ArrayBuffer)
      : (uniformWrite.data as Float32Array).buffer)
    expect(uniformData[0]).toBe(2) // sx
    expect(uniformData[5]).toBe(3) // sy
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
