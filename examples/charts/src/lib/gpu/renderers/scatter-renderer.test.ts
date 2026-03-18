import { describe, it, expect } from "vitest"
import { ScatterRenderer } from "./scatter-renderer"
import { createMockGPUDevice } from "../../test-helpers"
import { normalizeConfig } from "../../config/normalize"

describe("ScatterRenderer", () => {
  const gpu = createMockGPUDevice()

  it("draw(4, pointCount) を呼ぶ", () => {
    const data = Array.from({ length: 200 }, (_, i) => ({ x: i, y: i * 2 }))
    const config = normalizeConfig({
      type: "scatter",
      series: [{ data, label: "Points", pointRadius: 4 }],
    })
    const renderer = new ScatterRenderer(gpu, 4)
    renderer.prepare(gpu, [config.series[0]], {
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
    expect(drawCalls).toEqual([{ vertexCount: 4, instanceCount: 200 }])
  })

  it("0点のデータでは draw しない", () => {
    const config = normalizeConfig({
      type: "scatter",
      series: [{ data: [], label: "Empty" }],
    })
    const renderer = new ScatterRenderer(gpu, 4)
    renderer.prepare(gpu, [config.series[0]], {
      transformMatrix: new Float32Array(16),
      canvasWidth: 800, canvasHeight: 600,
    })
    const encoder = gpu.device.createCommandEncoder()
    renderer.render(encoder, {} as GPUTextureView)
  })
})
