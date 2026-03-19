import type { GPUContext, Figure } from "../../types"
import type { FigureRenderer } from "./base-renderer"
import { BufferManager } from "../buffer-manager"
import rectShader from "../shaders/rect.wgsl?raw"

export function packFiguresToFloat32(figures: Figure[]): Float32Array {
  const data = new Float32Array(figures.length * 8)
  for (let i = 0; i < figures.length; i++) {
    const f = figures[i]
    const o = i * 8
    data[o] = f.x
    data[o + 1] = f.y
    data[o + 2] = f.width
    data[o + 3] = f.height
    data[o + 4] = f.fill[0]
    data[o + 5] = f.fill[1]
    data[o + 6] = f.fill[2]
    data[o + 7] = f.fill[3]
  }
  return data
}

export class RectRenderer implements FigureRenderer {
  private pipeline: GPURenderPipeline | null = null
  private uniformBuffer: GPUBuffer | null = null
  private rectBuffer: BufferManager
  private bindGroup: GPUBindGroup | null = null
  private instanceCount: number = 0
  private sampleCount: number
  private gpu: GPUContext

  constructor(gpu: GPUContext, sampleCount: number) {
    this.gpu = gpu
    this.sampleCount = sampleCount
    this.rectBuffer = new BufferManager(gpu.device, GPUBufferUsage.STORAGE)
  }

  prepare(gpu: GPUContext, data: Float32Array, canvasWidth: number, canvasHeight: number): void {
    this.gpu = gpu
    this.instanceCount = data.length / 8

    if (this.instanceCount === 0) return

    // Uniform: canvasSize (2 floats, padded to 16 bytes)
    const uniformData = new Float32Array(4)
    uniformData[0] = canvasWidth
    uniformData[1] = canvasHeight

    if (!this.uniformBuffer) {
      this.uniformBuffer = gpu.device.createBuffer({
        size: 16,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      })
    }
    gpu.device.queue.writeBuffer(this.uniformBuffer, 0, uniformData)

    this.rectBuffer.write(data)

    if (!this.pipeline) {
      const shaderModule = gpu.device.createShaderModule({ code: rectShader })
      const bindGroupLayout = gpu.device.createBindGroupLayout({
        entries: [
          { binding: 0, visibility: GPUShaderStage.VERTEX, buffer: { type: "uniform" } },
          { binding: 1, visibility: GPUShaderStage.VERTEX, buffer: { type: "read-only-storage" } },
        ],
      })
      const pipelineLayout = gpu.device.createPipelineLayout({ bindGroupLayouts: [bindGroupLayout] })
      this.pipeline = gpu.device.createRenderPipeline({
        layout: pipelineLayout,
        vertex: { module: shaderModule, entryPoint: "vs_main" },
        fragment: {
          module: shaderModule,
          entryPoint: "fs_main",
          targets: [{
            format: gpu.format,
            blend: {
              color: { srcFactor: "src-alpha", dstFactor: "one-minus-src-alpha" },
              alpha: { srcFactor: "one", dstFactor: "one-minus-src-alpha" },
            },
          }],
        },
        primitive: { topology: "triangle-list" },
        multisample: { count: this.sampleCount },
      })
    }

    this.bindGroup = gpu.device.createBindGroup({
      layout: (this.pipeline as any).getBindGroupLayout?.(0) ?? gpu.device.createBindGroupLayout({
        entries: [
          { binding: 0, visibility: GPUShaderStage.VERTEX, buffer: { type: "uniform" } },
          { binding: 1, visibility: GPUShaderStage.VERTEX, buffer: { type: "read-only-storage" } },
        ],
      }),
      entries: [
        { binding: 0, resource: { buffer: this.uniformBuffer } },
        { binding: 1, resource: { buffer: this.rectBuffer.getBuffer()! } },
      ],
    })
  }

  render(encoder: GPUCommandEncoder, targetView: GPUTextureView, msaaView?: GPUTextureView): void {
    if (this.instanceCount === 0 || !this.pipeline || !this.bindGroup) return

    const pass = encoder.beginRenderPass({
      colorAttachments: [{
        view: msaaView ?? targetView,
        resolveTarget: msaaView ? targetView : undefined,
        loadOp: "load" as GPULoadOp,
        storeOp: "store" as GPUStoreOp,
      }],
    })
    pass.setPipeline(this.pipeline)
    pass.setBindGroup(0, this.bindGroup)
    pass.draw(6, this.instanceCount)
    pass.end()
  }

  destroy(): void {
    this.uniformBuffer?.destroy()
    this.rectBuffer.destroy()
    this.uniformBuffer = null
    this.pipeline = null
    this.bindGroup = null
  }
}
