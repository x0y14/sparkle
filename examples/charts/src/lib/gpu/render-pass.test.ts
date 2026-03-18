import { describe, it, expect } from "vitest"
import { RenderPassManager } from "./render-pass"
import { createMockGPUDevice } from "../test-helpers"
import { DirtyFlag } from "../types"
import type { GPUContext } from "../types"
import type { ChartRenderer } from "./renderers/base-renderer"

function createSpyRenderer(): ChartRenderer & { renderCalls: GPURenderPassDescriptor[] } {
  const renderCalls: GPURenderPassDescriptor[] = []
  return {
    renderCalls,
    prepare() {},
    render(encoder: GPUCommandEncoder, targetView: GPUTextureView, msaaView?: GPUTextureView) {
      const desc: GPURenderPassDescriptor = {
        colorAttachments: [{
          view: msaaView ?? targetView,
          resolveTarget: msaaView ? targetView : undefined,
          loadOp: "load" as GPULoadOp,
          storeOp: "store" as GPUStoreOp,
        }],
      }
      renderCalls.push(desc)
      const pass = encoder.beginRenderPass(desc)
      pass.end()
    },
    destroy() {},
  }
}

function createTrackingGPUDevice() {
  const base = createMockGPUDevice()
  const pipelineCalls: GPURenderPipelineDescriptor[] = []
  const setPipelineCalls: { pipeline: GPURenderPipeline }[] = []
  let pipelineIdCounter = 0

  const origDevice = base.device
  const device = new Proxy(origDevice, {
    get(target, prop) {
      if (prop === "createRenderPipeline") {
        return (desc: GPURenderPipelineDescriptor) => {
          pipelineCalls.push(desc)
          const id = pipelineIdCounter++
          return { __id: id } as unknown as GPURenderPipeline
        }
      }
      if (prop === "createCommandEncoder") {
        return () => {
          const encoder = target.createCommandEncoder()
          return new Proxy(encoder, {
            get(encTarget, encProp) {
              if (encProp === "beginRenderPass") {
                return (rpDesc: GPURenderPassDescriptor) => {
                  const pass = (encTarget as any).beginRenderPass(rpDesc)
                  return new Proxy(pass, {
                    get(passTarget, passProp) {
                      if (passProp === "setPipeline") {
                        return (pipeline: GPURenderPipeline) => {
                          setPipelineCalls.push({ pipeline })
                        }
                      }
                      return (passTarget as any)[passProp]
                    },
                  })
                }
              }
              return (encTarget as any)[encProp]
            },
          })
        }
      }
      return (target as any)[prop]
    },
  })

  return {
    gpu: { ...base, device } as GPUContext,
    pipelineCalls,
    setPipelineCalls,
  }
}

describe("RenderPassManager", () => {
  it("render が例外なく完了する", () => {
    const gpu = createMockGPUDevice()
    const rpm = new RenderPassManager(gpu, 4)
    rpm.render(
      800, 600, [], [], [],
      DirtyFlag.DATA | DirtyFlag.LAYOUT,
      { r: 1, g: 1, b: 1, a: 1 },
    )
  })

  it("mainRenderers の render が呼ばれる", () => {
    const gpu = createMockGPUDevice()
    const rpm = new RenderPassManager(gpu, 4)
    const spy = createSpyRenderer()
    rpm.render(
      800, 600, [spy], [], [],
      DirtyFlag.DATA | DirtyFlag.LAYOUT,
      { r: 1, g: 1, b: 1, a: 1 },
    )
    expect(spy.renderCalls.length).toBe(1)
  })

  it("annotationRenderers の render が呼ばれる", () => {
    const gpu = createMockGPUDevice()
    const rpm = new RenderPassManager(gpu, 4)
    const spy = createSpyRenderer()
    rpm.render(
      800, 600, [], [spy], [],
      DirtyFlag.DATA | DirtyFlag.ANNOTATION | DirtyFlag.LAYOUT,
      { r: 1, g: 1, b: 1, a: 1 },
    )
    expect(spy.renderCalls.length).toBe(1)
  })

  it("dirty が NONE なら mainRenderers は呼ばれない", () => {
    const gpu = createMockGPUDevice()
    const rpm = new RenderPassManager(gpu, 4)
    const spy = createSpyRenderer()
    rpm.render(
      800, 600, [spy], [], [],
      0, // NONE
      { r: 1, g: 1, b: 1, a: 1 },
    )
    expect(spy.renderCalls.length).toBe(0)
  })

  it("destroy が例外なく完了する", () => {
    const gpu = createMockGPUDevice()
    const rpm = new RenderPassManager(gpu, 4)
    rpm.destroy()
  })

  it("blit パイプラインが MSAA 用と直接描画用の2つ作成される", () => {
    const { gpu, pipelineCalls } = createTrackingGPUDevice()
    const rpm = new RenderPassManager(gpu, 4)
    rpm.render(
      800, 600, [], [], [],
      DirtyFlag.DATA | DirtyFlag.LAYOUT,
      { r: 1, g: 1, b: 1, a: 1 },
    )
    const blitPipelines = pipelineCalls.filter(
      (d) => d.primitive?.topology === "triangle-list",
    )
    expect(blitPipelines.length).toBe(2)
    const sampleCounts = blitPipelines.map((d) => d.multisample?.count ?? 1).sort()
    expect(sampleCounts).toEqual([1, 4])
  })

  it("Pass 2 は MSAA blit、Pass 3 は直接 blit パイプラインを使う", () => {
    const { gpu, pipelineCalls, setPipelineCalls } = createTrackingGPUDevice()
    const rpm = new RenderPassManager(gpu, 4)
    rpm.render(
      800, 600, [], [], [],
      DirtyFlag.DATA | DirtyFlag.LAYOUT,
      { r: 1, g: 1, b: 1, a: 1 },
    )
    // blit パイプライン: topology === "triangle-list"
    const blitPipelines = pipelineCalls.filter(
      (d) => d.primitive?.topology === "triangle-list",
    )
    const msaaPipeline = blitPipelines.find((d) => (d.multisample?.count ?? 1) === 4)!
    const directPipeline = blitPipelines.find((d) => (d.multisample?.count ?? 1) === 1)!
    const msaaIdx = pipelineCalls.indexOf(msaaPipeline)
    const directIdx = pipelineCalls.indexOf(directPipeline)

    // setPipeline の呼び出しから blit 用のものだけを取得
    const blitSetCalls = setPipelineCalls.filter((c) => {
      const id = (c.pipeline as any).__id
      return id === msaaIdx || id === directIdx
    })
    expect(blitSetCalls.length).toBe(2)
    expect((blitSetCalls[0].pipeline as any).__id).toBe(msaaIdx)  // Pass 2: MSAA
    expect((blitSetCalls[1].pipeline as any).__id).toBe(directIdx) // Pass 3: direct
  })
})
