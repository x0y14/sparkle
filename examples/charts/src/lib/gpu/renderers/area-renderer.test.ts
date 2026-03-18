import { describe, it, expect } from "vitest"
import { AreaRenderer } from "./area-renderer"
import { createMockGPUDevice } from "../../test-helpers"
import { normalizeConfig } from "../../config/normalize"

describe("AreaRenderer", () => {
  const gpu = createMockGPUDevice()

  it("draw の頂点数 = pointCount * 2", () => {
    const renderer = new AreaRenderer(gpu, 4)
    const config = normalizeConfig({
      type: "area",
      series: [{
        data: [{ x: 0, y: 10 }, { x: 1, y: 20 }, { x: 2, y: 15 }, { x: 3, y: 25 }, { x: 4, y: 30 }],
        label: "test",
      }],
    })
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
    expect(drawCalls).toEqual([{ vertexCount: 10, instanceCount: 1 }])
  })

  it("1点以下のデータでは draw しない", () => {
    const renderer = new AreaRenderer(gpu, 4)
    const config = normalizeConfig({
      type: "area",
      series: [{ data: [{ x: 0, y: 10 }], label: "test" }],
    })
    renderer.prepare(gpu, [config.series[0]], {
      transformMatrix: new Float32Array(16),
      canvasWidth: 800, canvasHeight: 600,
    })
    const encoder = gpu.device.createCommandEncoder()
    renderer.render(encoder, {} as GPUTextureView)
  })
})
