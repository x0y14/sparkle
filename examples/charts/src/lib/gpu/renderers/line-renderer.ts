import type { GPUContext, NormalizedSeries } from "../../types"
import type { ChartRenderer, RenderUniforms } from "./base-renderer"
import { BufferManager } from "../../data/buffer-manager"
import { packXY } from "../../data/packer"
import { hexToRGBA } from "../../config/color"
import lineShader from "../shaders/line.wgsl?raw"

export class LineRenderer implements ChartRenderer {
  private pipeline: GPURenderPipeline | null = null
  private bindGroupLayout: GPUBindGroupLayout | null = null
  private dataBuffer: BufferManager
  private uniformBuffer: GPUBuffer
  private bindGroup: GPUBindGroup | null = null
  private pointCount: number = 0
  private sampleCount: number
  private format: GPUTextureFormat

  constructor(gpu: GPUContext, sampleCount: number) {
    this.sampleCount = sampleCount
    this.format = gpu.format
    this.dataBuffer = new BufferManager(gpu.device, GPUBufferUsage.STORAGE)
    this.uniformBuffer = gpu.device.createBuffer({
      size: 128,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    })
  }

  prepare(gpu: GPUContext, series: NormalizedSeries[], uniforms: RenderUniforms): void {
    const s = series[0]
    if (!s) return

    const packed = packXY(s.accessor, s.offsetX, s.offsetY)
    this.dataBuffer.write(packed)
    this.pointCount = s.accessor.getCount()

    const [r, g, b, a] = hexToRGBA(s.color)
    const uniformData = new Float32Array(32)
    uniformData.set(uniforms.transformMatrix, 0)
    uniformData[16] = uniforms.canvasWidth
    uniformData[17] = uniforms.canvasHeight
    uniformData[18] = s.lineWidth
    uniformData[19] = 1.0 // opacity
    uniformData[20] = r
    uniformData[21] = g
    uniformData[22] = b
    uniformData[23] = a
    gpu.device.queue.writeBuffer(this.uniformBuffer, 0, uniformData)

    if (!this.pipeline) {
      const shaderModule = gpu.device.createShaderModule({ code: lineShader })
      this.bindGroupLayout = gpu.device.createBindGroupLayout({
        entries: [
          { binding: 0, visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, buffer: { type: "uniform" } },
          { binding: 1, visibility: GPUShaderStage.VERTEX, buffer: { type: "read-only-storage" } },
        ],
      })
      const pipelineLayout = gpu.device.createPipelineLayout({ bindGroupLayouts: [this.bindGroupLayout] })
      this.pipeline = gpu.device.createRenderPipeline({
        layout: pipelineLayout,
        vertex: { module: shaderModule, entryPoint: "vs_main" },
        fragment: {
          module: shaderModule,
          entryPoint: "fs_main",
          targets: [{
            format: this.format,
            blend: {
              color: { srcFactor: "src-alpha", dstFactor: "one-minus-src-alpha" },
              alpha: { srcFactor: "one", dstFactor: "one-minus-src-alpha" },
            },
          }],
        },
        primitive: { topology: "triangle-strip", cullMode: "none" },
        multisample: { count: this.sampleCount },
      })
    }

    // Always recreate bind group (buffer may have been reallocated)
    this.bindGroup = gpu.device.createBindGroup({
      layout: this.bindGroupLayout!,
      entries: [
        { binding: 0, resource: { buffer: this.uniformBuffer } },
        { binding: 1, resource: { buffer: this.dataBuffer.getBuffer()! } },
      ],
    })
  }

  render(encoder: GPUCommandEncoder, targetView: GPUTextureView, msaaView?: GPUTextureView): void {
    if (!this.pipeline || !this.bindGroup || this.pointCount < 2) return

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
    pass.draw(4, this.pointCount - 1)
    pass.end()
  }

  destroy(): void {
    this.dataBuffer.destroy()
  }
}
