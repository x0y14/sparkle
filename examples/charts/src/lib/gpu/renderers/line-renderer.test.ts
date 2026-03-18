import { describe, it, expect } from "vitest"
import { LineRenderer } from "./line-renderer"
import { createMockGPUDevice } from "../../test-helpers"
import { normalizeConfig } from "../../config/normalize"

describe("LineRenderer", () => {
  const gpu = createMockGPUDevice()

  it("prepare でパイプラインとバインドグループを生成する", () => {
    const renderer = new LineRenderer(gpu, 4)
    const config = normalizeConfig({
      type: "line",
      series: [{ data: [{ x: 0, y: 0 }, { x: 1, y: 1 }], label: "test" }],
    })
    const uniforms = {
      transformMatrix: new Float32Array(16),
      canvasWidth: 800,
      canvasHeight: 600,
    }
    renderer.prepare(gpu, [config.series[0]], uniforms)
  })

  it("render で draw(4, N-1) を呼ぶ", () => {
    const renderer = new LineRenderer(gpu, 4)
    const config = normalizeConfig({
      type: "line",
      series: [{ data: [{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 }], label: "test" }],
    })
    const uniforms = {
      transformMatrix: new Float32Array(16),
      canvasWidth: 800,
      canvasHeight: 600,
    }
    renderer.prepare(gpu, [config.series[0]], uniforms)

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
    expect(drawCalls).toEqual([{ vertexCount: 4, instanceCount: 2 }])
  })

  it("1点以下のデータでは draw しない", () => {
    const renderer = new LineRenderer(gpu, 4)
    const config = normalizeConfig({
      type: "line",
      series: [{ data: [{ x: 0, y: 0 }], label: "test" }],
    })
    renderer.prepare(gpu, [config.series[0]], {
      transformMatrix: new Float32Array(16),
      canvasWidth: 800, canvasHeight: 600,
    })
    const encoder = gpu.device.createCommandEncoder()
    renderer.render(encoder, {} as GPUTextureView)
  })
})
