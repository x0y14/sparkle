import type { GPUContext, Figure } from "../../types"
import type { FigureRenderer } from "./base-renderer"
import { BufferManager } from "../buffer-manager"
import rectShader from "../shaders/rect.wgsl?raw"

export const OUTLINE_WIDTH = 2
export const HANDLE_SIZE = 8

export function packSelectionToFloat32(figure: Figure): Float32Array {
  const data = new Float32Array(64) // 8 instances * 8 floats
  const { x, y, width: w, height: h } = figure
  const half = HANDLE_SIZE / 2

  // Outline: top, bottom, left, right (white)
  // top
  data[0] = x; data[1] = y; data[2] = w; data[3] = OUTLINE_WIDTH
  data[4] = 1; data[5] = 1; data[6] = 1; data[7] = 1
  // bottom
  data[8] = x; data[9] = y + h - OUTLINE_WIDTH; data[10] = w; data[11] = OUTLINE_WIDTH
  data[12] = 1; data[13] = 1; data[14] = 1; data[15] = 1
  // left
  data[16] = x; data[17] = y; data[18] = OUTLINE_WIDTH; data[19] = h
  data[20] = 1; data[21] = 1; data[22] = 1; data[23] = 1
  // right
  data[24] = x + w - OUTLINE_WIDTH; data[25] = y; data[26] = OUTLINE_WIDTH; data[27] = h
  data[28] = 1; data[29] = 1; data[30] = 1; data[31] = 1

  // Handles: top, right, bottom, left (white)
  const cx_top = x + w / 2; const cy_top = y
  data[32] = cx_top - half; data[33] = cy_top - half; data[34] = HANDLE_SIZE; data[35] = HANDLE_SIZE
  data[36] = 1; data[37] = 1; data[38] = 1; data[39] = 1

  const cx_right = x + w; const cy_right = y + h / 2
  data[40] = cx_right - half; data[41] = cy_right - half; data[42] = HANDLE_SIZE; data[43] = HANDLE_SIZE
  data[44] = 1; data[45] = 1; data[46] = 1; data[47] = 1

  const cx_bottom = x + w / 2; const cy_bottom = y + h
  data[48] = cx_bottom - half; data[49] = cy_bottom - half; data[50] = HANDLE_SIZE; data[51] = HANDLE_SIZE
  data[52] = 1; data[53] = 1; data[54] = 1; data[55] = 1

  const cx_left = x; const cy_left = y + h / 2
  data[56] = cx_left - half; data[57] = cy_left - half; data[58] = HANDLE_SIZE; data[59] = HANDLE_SIZE
  data[60] = 1; data[61] = 1; data[62] = 1; data[63] = 1

  return data
}

export class SelectionRenderer implements FigureRenderer {
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
