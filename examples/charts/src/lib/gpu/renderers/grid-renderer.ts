import type { GPUContext, NormalizedConfig, NormalizedSeries, LinearScale, PlotRect } from "../../types"
import type { ChartRenderer, RenderUniforms } from "./base-renderer"
import { BufferManager } from "../../data/buffer-manager"
import { hexToRGBA } from "../../config/color"
import gridShader from "../shaders/grid.wgsl?raw"

export function computeGridLines(
  scaleX: LinearScale,
  scaleY: LinearScale,
  plotRect: PlotRect,
  canvasWidth: number,
  canvasHeight: number,
  tickCountX: number,
  tickCountY: number,
): Float32Array {
  const xTicks = scaleX.ticks(tickCountX)
  const yTicks = scaleY.ticks(tickCountY)

  const lines: number[] = []

  // Vertical lines for X ticks
  for (const tick of xTicks) {
    const clipX = scaleX.map(tick)
    const screenX = (clipX + 1) * 0.5 * canvasWidth
    if (screenX >= plotRect.x && screenX <= plotRect.x + plotRect.width) {
      lines.push(screenX, plotRect.y, screenX, plotRect.y + plotRect.height)
    }
  }

  // Horizontal lines for Y ticks
  for (const tick of yTicks) {
    const clipY = scaleY.map(tick)
    const screenY = (1 - clipY) * 0.5 * canvasHeight
    if (screenY >= plotRect.y && screenY <= plotRect.y + plotRect.height) {
      lines.push(plotRect.x, screenY, plotRect.x + plotRect.width, screenY)
    }
  }

  return new Float32Array(lines)
}

export class GridRenderer implements ChartRenderer {
  private pipeline: GPURenderPipeline | null = null
  private bindGroupLayout: GPUBindGroupLayout | null = null
  private dataBuffer: BufferManager
  private uniformBuffer: GPUBuffer
  private bindGroup: GPUBindGroup | null = null
  private lineCount: number = 0
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

  prepareGrid(
    gpu: GPUContext,
    config: NormalizedConfig,
    scaleX: LinearScale,
    scaleY: LinearScale,
    plotRect: PlotRect,
    canvasWidth: number,
    canvasHeight: number,
  ): void {
    const gridLines = computeGridLines(
      scaleX, scaleY, plotRect,
      canvasWidth, canvasHeight,
      config.xAxis.tickCount, config.yAxis.tickCount,
    )
    this.lineCount = gridLines.length / 4
    if (this.lineCount === 0) return

    this.dataBuffer.write(gridLines)

    const [r, g, b, a] = hexToRGBA(config.theme.colors.gridLine)
    const uniformData = new Float32Array(32)
    // Identity transform (grid lines are in screen space)
    uniformData[0] = 1; uniformData[5] = 1; uniformData[10] = 1; uniformData[15] = 1
    uniformData[16] = canvasWidth
    uniformData[17] = canvasHeight
    uniformData[18] = 1 // lineWidth
    uniformData[19] = 0.3 // opacity
    uniformData[20] = r
    uniformData[21] = g
    uniformData[22] = b
    uniformData[23] = a
    gpu.device.queue.writeBuffer(this.uniformBuffer, 0, uniformData)

    if (!this.pipeline) {
      const shaderModule = gpu.device.createShaderModule({ code: gridShader })
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
        primitive: { topology: "triangle-list", cullMode: "none" },
        multisample: { count: this.sampleCount },
      })
    }

    this.bindGroup = gpu.device.createBindGroup({
      layout: this.bindGroupLayout!,
      entries: [
        { binding: 0, resource: { buffer: this.uniformBuffer } },
        { binding: 1, resource: { buffer: this.dataBuffer.getBuffer()! } },
      ],
    })
  }

  // ChartRenderer interface (used by RenderPassManager)
  prepare(_gpu: GPUContext, _series: NormalizedSeries[], _uniforms: RenderUniforms): void {
    // Use prepareGrid instead
  }

  render(encoder: GPUCommandEncoder, targetView: GPUTextureView, msaaView?: GPUTextureView): void {
    if (!this.pipeline || !this.bindGroup || this.lineCount === 0) return

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
    this.dataBuffer.destroy()
  }
}
