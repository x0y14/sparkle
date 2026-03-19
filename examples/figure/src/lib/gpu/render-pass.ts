import type { GPUContext } from "../types"
import { MSAAManager } from "./msaa"
import type { FigureRenderer } from "./renderers/base-renderer"
import blitShader from "./shaders/blit.wgsl?raw"

export class RenderPassManager {
  private gpu: GPUContext
  private msaa: MSAAManager
  private blitPipeline: GPURenderPipeline | null = null
  private blitBindGroup: GPUBindGroup | null = null
  private sampler: GPUSampler

  constructor(gpu: GPUContext, sampleCount: number) {
    this.gpu = gpu
    this.msaa = new MSAAManager(gpu.device, gpu.format, sampleCount)
    this.sampler = gpu.device.createSampler({ magFilter: "linear", minFilter: "linear" })
  }

  render(
    width: number,
    height: number,
    renderers: FigureRenderer[],
    clearColor: { r: number; g: number; b: number; a: number },
  ): void {
    if (width === 0 || height === 0) return

    const { msaaView, resolveView, resolveTexture } = this.msaa.ensure(width, height)
    const encoder = this.gpu.device.createCommandEncoder()

    // Clear pass
    const clearPass = encoder.beginRenderPass({
      colorAttachments: [{
        view: msaaView,
        resolveTarget: resolveView,
        clearValue: clearColor,
        loadOp: "clear" as GPULoadOp,
        storeOp: "store" as GPUStoreOp,
      }],
    })
    clearPass.end()

    // Render each renderer
    for (const renderer of renderers) {
      renderer.render(encoder, resolveView, msaaView)
    }

    // Blit to screen
    const screenTexture = this.gpu.context.getCurrentTexture()
    const screenView = screenTexture.createView()

    if (!this.blitPipeline) {
      const shaderModule = this.gpu.device.createShaderModule({ code: blitShader })
      this.blitPipeline = this.gpu.device.createRenderPipeline({
        layout: "auto" as any,
        vertex: { module: shaderModule, entryPoint: "vs_main" },
        fragment: {
          module: shaderModule,
          entryPoint: "fs_main",
          targets: [{ format: this.gpu.format }],
        },
        primitive: { topology: "triangle-list" },
      })
    }

    this.blitBindGroup = this.gpu.device.createBindGroup({
      layout: (this.blitPipeline as any).getBindGroupLayout?.(0) ?? this.gpu.device.createBindGroupLayout({
        entries: [
          { binding: 0, visibility: GPUShaderStage.FRAGMENT, texture: {} },
          { binding: 1, visibility: GPUShaderStage.FRAGMENT, sampler: {} },
        ],
      }),
      entries: [
        { binding: 0, resource: resolveTexture.createView() },
        { binding: 1, resource: this.sampler },
      ],
    })

    const blitPass = encoder.beginRenderPass({
      colorAttachments: [{
        view: screenView,
        loadOp: "clear" as GPULoadOp,
        storeOp: "store" as GPUStoreOp,
        clearValue: { r: 0, g: 0, b: 0, a: 1 },
      }],
    })
    blitPass.setPipeline(this.blitPipeline)
    blitPass.setBindGroup(0, this.blitBindGroup)
    blitPass.draw(3)
    blitPass.end()

    this.gpu.device.queue.submit([encoder.finish()])
  }

  destroy(): void {
    this.msaa.destroy()
    this.blitPipeline = null
    this.blitBindGroup = null
  }
}
