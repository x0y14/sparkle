import { describe, it, expect } from "vitest"
import { RenderPassManager } from "./render-pass"
import { createMockGPUDevice } from "../test-helpers"
import type { FigureRenderer } from "./renderers/base-renderer"

function createSpyRenderer(): FigureRenderer & { renderCalls: number } {
  let calls = 0
  return {
    get renderCalls() { return calls },
    prepare() {},
    render(encoder: GPUCommandEncoder, targetView: GPUTextureView, msaaView?: GPUTextureView) {
      calls++
      const pass = encoder.beginRenderPass({
        colorAttachments: [{
          view: msaaView ?? targetView,
          resolveTarget: msaaView ? targetView : undefined,
          loadOp: "load" as GPULoadOp,
          storeOp: "store" as GPUStoreOp,
        }],
      })
      pass.end()
    },
    destroy() {},
  }
}

describe("RenderPassManager", () => {
  it("renderが例外なく完了する", () => {
    const gpu = createMockGPUDevice()
    const rpm = new RenderPassManager(gpu, 4)
    rpm.render(800, 600, [], { r: 0.1, g: 0.1, b: 0.18, a: 1 })
  })

  it("全rendererのrenderが呼ばれる", () => {
    const gpu = createMockGPUDevice()
    const rpm = new RenderPassManager(gpu, 4)
    const spy1 = createSpyRenderer()
    const spy2 = createSpyRenderer()
    rpm.render(800, 600, [spy1, spy2], { r: 0.1, g: 0.1, b: 0.18, a: 1 })
    expect(spy1.renderCalls).toBe(1)
    expect(spy2.renderCalls).toBe(1)
  })

  it("destroyが例外なく完了する", () => {
    const gpu = createMockGPUDevice()
    const rpm = new RenderPassManager(gpu, 4)
    rpm.destroy()
  })
})
