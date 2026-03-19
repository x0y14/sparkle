import type { GPUContext } from "../../types"
import type { FigureRenderer } from "./base-renderer"
import { BufferManager } from "../buffer-manager"
import gridShader from "../shaders/grid.wgsl?raw"

export function computeGridLines(canvasWidth: number, canvasHeight: number, gridSize: number): Float32Array {
  if (gridSize <= 0) return new Float32Array(0)
  const lines: number[] = []

  for (let x = gridSize; x < canvasWidth; x += gridSize) {
    lines.push(x, 0, x, canvasHeight)
  }
  for (let y = gridSize; y < canvasHeight; y += gridSize) {
    lines.push(0, y, canvasWidth, y)
  }

  return new Float32Array(lines)
}

export class GridRenderer implements FigureRenderer {
  private pipeline: GPURenderPipeline | null = null
  private uniformBuffer: GPUBuffer | null = null
  private lineBuffer: BufferManager
  private bindGroup: GPUBindGroup | null = null
  private lineCount: number = 0
  private sampleCount: number
  private gpu: GPUContext

  constructor(gpu: GPUContext, sampleCount: number) {
    this.gpu = gpu
    this.sampleCount = sampleCount
    this.lineBuffer = new BufferManager(gpu.device, GPUBufferUsage.STORAGE)
  }

  prepare(gpu: GPUContext, data: Float32Array, canvasWidth: number, canvasHeight: number): void {
    this.gpu = gpu
    this.lineCount = data.length / 4

    if (this.lineCount === 0) return

    // Uniform: mat4x4 (16) + canvasSize (2) + lineWidth (1) + opacity (1) + color (4) = 24 floats = 96 bytes
    const uniformData = new Float32Array(24)
    // identity mat4x4
    uniformData[0] = 1; uniformData[5] = 1; uniformData[10] = 1; uniformData[15] = 1
    uniformData[16] = canvasWidth
    uniformData[17] = canvasHeight
    uniformData[18] = 1.0 // lineWidth
    uniformData[19] = 0.15 // opacity
    uniformData[20] = 1.0 // color r
    uniformData[21] = 1.0 // color g
    uniformData[22] = 1.0 // color b
    uniformData[23] = 1.0 // color a

    if (!this.uniformBuffer) {
      this.uniformBuffer = gpu.device.createBuffer({
        size: uniformData.byteLength,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      })
    }
    gpu.device.queue.writeBuffer(this.uniformBuffer, 0, uniformData)

    this.lineBuffer.write(data)

    if (!this.pipeline) {
      const shaderModule = gpu.device.createShaderModule({ code: gridShader })
      const bindGroupLayout = gpu.device.createBindGroupLayout({
        entries: [
          { binding: 0, visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, buffer: { type: "uniform" } },
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
          { binding: 0, visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, buffer: { type: "uniform" } },
          { binding: 1, visibility: GPUShaderStage.VERTEX, buffer: { type: "read-only-storage" } },
        ],
      }),
      entries: [
        { binding: 0, resource: { buffer: this.uniformBuffer } },
        { binding: 1, resource: { buffer: this.lineBuffer.getBuffer()! } },
      ],
    })
  }

  render(encoder: GPUCommandEncoder, targetView: GPUTextureView, msaaView?: GPUTextureView): void {
    if (this.lineCount === 0 || !this.pipeline || !this.bindGroup) return

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
    pass.draw(6, this.lineCount)
    pass.end()
  }

  destroy(): void {
    this.uniformBuffer?.destroy()
    this.lineBuffer.destroy()
    this.uniformBuffer = null
    this.pipeline = null
    this.bindGroup = null
  }
}
