import type { GPUContext } from "../types"
import { MSAAManager } from "./msaa"
import type { ChartRenderer } from "./renderers/base-renderer"
import { DirtyFlag } from "../types"
import blitShader from "./shaders/blit.wgsl?raw"

interface ClearColor {
  r: number; g: number; b: number; a: number
}

export class RenderPassManager {
  private pass1Msaa: MSAAManager
  private pass2Msaa: MSAAManager
  private gpu: GPUContext
  private sampleCount: number
  private blitPipelineMsaa: GPURenderPipeline | null = null
  private blitPipelineDirect: GPURenderPipeline | null = null
  private blitBindGroupLayout: GPUBindGroupLayout | null = null
  private sampler: GPUSampler | null = null

  constructor(gpu: GPUContext, sampleCount: number) {
    this.gpu = gpu
    this.sampleCount = sampleCount
    this.pass1Msaa = new MSAAManager(gpu.device, gpu.format, sampleCount)
    this.pass2Msaa = new MSAAManager(gpu.device, gpu.format, sampleCount)
  }

  private ensureBlitPipelines(): void {
    if (this.blitPipelineMsaa) return
    const device = this.gpu.device
    const shaderModule = device.createShaderModule({ code: blitShader })
    this.blitBindGroupLayout = device.createBindGroupLayout({
      entries: [
        { binding: 0, visibility: GPUShaderStage.FRAGMENT, texture: { sampleType: "float" } },
        { binding: 1, visibility: GPUShaderStage.FRAGMENT, sampler: { type: "filtering" } },
      ],
    })
    const pipelineLayout = device.createPipelineLayout({
      bindGroupLayouts: [this.blitBindGroupLayout],
    })
    const createPipeline = (sc: number) => device.createRenderPipeline({
      layout: pipelineLayout,
      vertex: { module: shaderModule, entryPoint: "vs_main" },
      fragment: {
        module: shaderModule,
        entryPoint: "fs_main",
        targets: [{ format: this.gpu.format }],
      },
      primitive: { topology: "triangle-list" },
      multisample: { count: sc },
    })
    this.blitPipelineMsaa = createPipeline(this.sampleCount)
    this.blitPipelineDirect = createPipeline(1)
    this.sampler = device.createSampler({ magFilter: "linear", minFilter: "linear" })
  }

  private blit(
    encoder: GPUCommandEncoder,
    sourceTexture: GPUTexture,
    targetView: GPUTextureView,
    msaaView?: GPUTextureView,
    loadOp: GPULoadOp = "load",
    clearValue?: ClearColor,
  ): void {
    this.ensureBlitPipelines()
    const pipeline = msaaView ? this.blitPipelineMsaa! : this.blitPipelineDirect!
    const sourceView = sourceTexture.createView()
    const bindGroup = this.gpu.device.createBindGroup({
      layout: this.blitBindGroupLayout!,
      entries: [
        { binding: 0, resource: sourceView },
        { binding: 1, resource: this.sampler! },
      ],
    })
    const colorAttachment: GPURenderPassColorAttachment = {
      view: msaaView ?? targetView,
      resolveTarget: msaaView ? targetView : undefined,
      loadOp,
      storeOp: "store" as GPUStoreOp,
    }
    if (loadOp === "clear" && clearValue) {
      colorAttachment.clearValue = clearValue
    }
    const pass = encoder.beginRenderPass({ colorAttachments: [colorAttachment] })
    pass.setPipeline(pipeline)
    pass.setBindGroup(0, bindGroup)
    pass.draw(3, 1)
    pass.end()
  }

  render(
    width: number, height: number,
    mainRenderers: ChartRenderer[],
    annotationRenderers: ChartRenderer[],
    overlayRenderers: ChartRenderer[],
    dirtyFlags: number,
    clearColor: ClearColor,
  ): void {
    const encoder = this.gpu.device.createCommandEncoder()
    const outputTexture = this.gpu.context.getCurrentTexture()
    const outputView = outputTexture.createView()

    // Pass 1: Main scene (background clear + grid + chart data)
    if (dirtyFlags & (DirtyFlag.DATA | DirtyFlag.LAYOUT)) {
      const { msaaView, resolveView } = this.pass1Msaa.ensure(width, height)
      // Clear MSAA texture with background color
      const clearPass = encoder.beginRenderPass({
        colorAttachments: [{
          view: msaaView,
          resolveTarget: resolveView,
          loadOp: "clear" as GPULoadOp,
          clearValue: clearColor,
          storeOp: "store" as GPUStoreOp,
        }],
      })
      clearPass.end()
      // Each renderer appends with loadOp: "load"
      for (const renderer of mainRenderers) {
        renderer.render(encoder, resolveView, msaaView)
      }
    }

    // Pass 2: Blit pass 1 result + annotations
    if (dirtyFlags & (DirtyFlag.DATA | DirtyFlag.ANNOTATION | DirtyFlag.LAYOUT)) {
      const { msaaView, resolveView } = this.pass2Msaa.ensure(width, height)
      // Blit pass 1's resolveTexture (also clears MSAA)
      this.blit(
        encoder, this.pass1Msaa.getResolveTexture()!,
        resolveView, msaaView,
        "clear", { r: 0, g: 0, b: 0, a: 0 },
      )
      // Layer annotations on top
      for (const renderer of annotationRenderers) {
        renderer.render(encoder, resolveView, msaaView)
      }
    }

    // Pass 3: Blit pass 2 result → canvas + overlays
    const pass2Texture = this.pass2Msaa.getResolveTexture()
    if (pass2Texture) {
      this.blit(
        encoder, pass2Texture,
        outputView, undefined,
        "clear", clearColor,
      )
    }
    for (const renderer of overlayRenderers) {
      renderer.render(encoder, outputView)
    }

    this.gpu.device.queue.submit([encoder.finish()])
  }

  destroy(): void {
    this.pass1Msaa.destroy()
    this.pass2Msaa.destroy()
  }
}
