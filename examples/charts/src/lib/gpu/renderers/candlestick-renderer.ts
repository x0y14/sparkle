import type { GPUContext, NormalizedSeries, LinearScale } from "../../types"
import type { ChartRenderer, RenderUniforms } from "./base-renderer"
import { BufferManager } from "../../data/buffer-manager"
import { createLinearScale } from "../../scales/linear-scale"
import candlestickShader from "../shaders/candlestick.wgsl?raw"

export interface CandlestickBar {
  x: number
  open: number
  high: number
  low: number
  close: number
  width: number
  colorUp: [number, number, number, number]
  colorDown: [number, number, number, number]
}

export function computeCandlestickBars(
  series: NormalizedSeries,
  scaleX: LinearScale,
  scaleY: LinearScale,
  barWidthClip: number,
  upColor: [number, number, number],
  downColor: [number, number, number],
): CandlestickBar[] {
  const bars: CandlestickBar[] = []
  const count = series.accessor.getCount()

  for (let i = 0; i < count; i++) {
    const time = series.accessor.getX(i) - series.offsetX
    const open = series.accessor.getOpen(i) - series.offsetY
    const high = series.accessor.getHigh(i) - series.offsetY
    const low = series.accessor.getLow(i) - series.offsetY
    const close = series.accessor.getClose(i) - series.offsetY

    bars.push({
      x: time,
      open,
      high,
      low,
      close,
      width: barWidthClip,
      colorUp: [upColor[0], upColor[1], upColor[2], 1.0],
      colorDown: [downColor[0], downColor[1], downColor[2], 1.0],
    })
  }

  return bars
}

export class CandlestickRenderer implements ChartRenderer {
  private pipeline: GPURenderPipeline | null = null
  private bindGroupLayout: GPUBindGroupLayout | null = null
  private dataBuffer: BufferManager
  private uniformBuffer: GPUBuffer
  private bindGroup: GPUBindGroup | null = null
  private barCount: number = 0
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

    const count = s.accessor.getCount()
    this.barCount = count

    // Compute bar width in data space
    let barWidthData = 0.6
    if (count >= 2) {
      const dx = Math.abs(
        (s.accessor.getX(1) - s.offsetX) - (s.accessor.getX(0) - s.offsetX),
      )
      barWidthData = dx * 0.6
    }

    const upColor: [number, number, number] = [0.16, 0.68, 0.34]
    const downColor: [number, number, number] = [0.84, 0.18, 0.18]

    // Build scales for coordinate computation
    const bounds = s.accessor.getBoundsX()
    const boundsY = s.accessor.getBoundsY()
    const scaleX = createLinearScale(bounds.min, bounds.max, -1, 1)
    const scaleY = createLinearScale(boundsY.min, boundsY.max, -1, 1)

    const bars = computeCandlestickBars(s, scaleX, scaleY, barWidthData, upColor, downColor)

    // Pack CandleInstance: x, open, high, low, close, width, pad0, pad1, colorUp(vec4), colorDown(vec4) = 16 floats
    const candleData = new Float32Array(bars.length * 16)
    for (let i = 0; i < bars.length; i++) {
      const b = bars[i]
      candleData[i * 16 + 0] = b.x
      candleData[i * 16 + 1] = b.open
      candleData[i * 16 + 2] = b.high
      candleData[i * 16 + 3] = b.low
      candleData[i * 16 + 4] = b.close
      candleData[i * 16 + 5] = b.width
      candleData[i * 16 + 6] = 0 // pad
      candleData[i * 16 + 7] = 0 // pad
      candleData[i * 16 + 8] = b.colorUp[0]
      candleData[i * 16 + 9] = b.colorUp[1]
      candleData[i * 16 + 10] = b.colorUp[2]
      candleData[i * 16 + 11] = b.colorUp[3]
      candleData[i * 16 + 12] = b.colorDown[0]
      candleData[i * 16 + 13] = b.colorDown[1]
      candleData[i * 16 + 14] = b.colorDown[2]
      candleData[i * 16 + 15] = b.colorDown[3]
    }
    this.dataBuffer.write(candleData)

    const uniformData = new Float32Array(32)
    uniformData.set(uniforms.transformMatrix, 0)
    uniformData[16] = uniforms.canvasWidth
    uniformData[17] = uniforms.canvasHeight
    uniformData[18] = 0 // lineWidth
    uniformData[19] = 1.0 // opacity
    gpu.device.queue.writeBuffer(this.uniformBuffer, 0, uniformData)

    if (!this.pipeline) {
      const shaderModule = gpu.device.createShaderModule({ code: candlestickShader })
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

  render(encoder: GPUCommandEncoder, targetView: GPUTextureView, msaaView?: GPUTextureView): void {
    if (!this.pipeline || !this.bindGroup || this.barCount === 0) return

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
    pass.draw(18, this.barCount)
    pass.end()
  }

  destroy(): void {
    this.dataBuffer.destroy()
  }
}
