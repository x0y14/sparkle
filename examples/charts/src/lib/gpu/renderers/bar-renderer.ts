import type { GPUContext, NormalizedSeries, LinearScale } from "../../types"
import type { ChartRenderer, RenderUniforms } from "./base-renderer"
import { BufferManager } from "../../data/buffer-manager"
import { hexToRGBA } from "../../config/color"
import { createLinearScale } from "../../scales/linear-scale"
import barShader from "../shaders/bar.wgsl?raw"

export interface BarRect {
  clipX: number
  clipY: number
  clipWidth: number
  clipHeight: number
  r: number; g: number; b: number; a: number
}

export function computeBarLayout(
  series: NormalizedSeries[],
  scaleX: LinearScale,
  scaleY: LinearScale,
): BarRect[] {
  const rects: BarRect[] = []

  // Separate stacked vs clustered series
  const stackGroups = new Map<string, NormalizedSeries[]>()
  const clustered: NormalizedSeries[] = []

  for (const s of series) {
    if (s.stackId) {
      const group = stackGroups.get(s.stackId) ?? []
      group.push(s)
      stackGroups.set(s.stackId, group)
    } else {
      clustered.push(s)
    }
  }

  const allClustered = [...clustered]
  for (const group of stackGroups.values()) {
    allClustered.push(group[0]) // count each stack group as 1 cluster slot
  }
  const totalSlots = allClustered.length
  const barWidth = series[0]?.barWidth ?? 0.8

  // Clustered bars
  const clusterIdx = new Map<NormalizedSeries, number>()
  let slot = 0
  for (const s of clustered) {
    clusterIdx.set(s, slot++)
  }

  const baseY = scaleY.map(Math.max(0, scaleY.domain[0]))

  for (const s of clustered) {
    const idx = clusterIdx.get(s)!
    const [cr, cg, cb, ca] = hexToRGBA(s.color)
    const categoryWidth = barWidth / totalSlots
    const offset = -barWidth / 2 + idx * categoryWidth

    for (let i = 0; i < s.accessor.getCount(); i++) {
      const dataX = s.accessor.getX(i)
      const dataY = s.accessor.getY(i)
      const left = scaleX.map(dataX + offset)
      const right = scaleX.map(dataX + offset + categoryWidth)
      const top = scaleY.map(dataY)

      rects.push({
        clipX: left,
        clipY: Math.min(top, baseY),
        clipWidth: right - left,
        clipHeight: Math.abs(top - baseY),
        r: cr, g: cg, b: cb, a: ca,
      })
    }
  }

  // Stacked bars
  for (const [, group] of stackGroups) {
    const stackSlot = slot++
    const categoryWidth = barWidth / totalSlots
    const offset = -barWidth / 2 + stackSlot * categoryWidth

    // Track positive and negative accumulation per data index
    const posAccum = new Map<number, number>()
    const negAccum = new Map<number, number>()

    for (const s of group) {
      const [cr, cg, cb, ca] = hexToRGBA(s.color)

      for (let i = 0; i < s.accessor.getCount(); i++) {
        const dataX = s.accessor.getX(i)
        const dataY = s.accessor.getY(i)

        let bottom: number
        let top: number

        if (dataY >= 0) {
          bottom = posAccum.get(i) ?? 0
          top = bottom + dataY
          posAccum.set(i, top)
        } else {
          top = negAccum.get(i) ?? 0
          bottom = top + dataY
          negAccum.set(i, bottom)
        }

        const left = scaleX.map(dataX + offset)
        const right = scaleX.map(dataX + offset + categoryWidth)
        const clipTop = scaleY.map(top)
        const clipBottom = scaleY.map(bottom)

        rects.push({
          clipX: left,
          clipY: Math.min(clipTop, clipBottom),
          clipWidth: right - left,
          clipHeight: Math.abs(clipTop - clipBottom),
          r: cr, g: cg, b: cb, a: ca,
        })
      }
    }
  }

  return rects
}

export class BarRenderer implements ChartRenderer {
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
    if (series.length === 0) return

    // For bar charts, we need scales from uniforms.transformMatrix
    // But we also need the original domain for computeBarLayout
    // We'll extract from the series bounds
    const allX: number[] = []
    const allY: number[] = []
    for (const s of series) {
      for (let i = 0; i < s.accessor.getCount(); i++) {
        allX.push(s.accessor.getX(i))
        allY.push(s.accessor.getY(i))
      }
    }

    const xMin = Math.min(...allX)
    const xMax = Math.max(...allX)
    const yMin = Math.min(0, Math.min(...allY))
    const yMax = Math.max(...allY)
    const scaleX = createLinearScale(xMin - 0.5, xMax + 0.5, -1, 1)
    const scaleY = createLinearScale(yMin, yMax, -1, 1)

    const rects = computeBarLayout(series, scaleX, scaleY)
    this.barCount = rects.length

    // Pack into storage buffer: 8 floats per bar
    const barData = new Float32Array(rects.length * 8)
    for (let i = 0; i < rects.length; i++) {
      const r = rects[i]
      barData[i * 8 + 0] = r.clipX
      barData[i * 8 + 1] = r.clipY
      barData[i * 8 + 2] = r.clipWidth
      barData[i * 8 + 3] = r.clipHeight
      barData[i * 8 + 4] = r.r
      barData[i * 8 + 5] = r.g
      barData[i * 8 + 6] = r.b
      barData[i * 8 + 7] = r.a
    }
    this.dataBuffer.write(barData)

    // Uniform: identity transform (rects are already in clip space), canvas size, opacity
    const uniformData = new Float32Array(32)
    // Identity matrix
    uniformData[0] = 1; uniformData[5] = 1; uniformData[10] = 1; uniformData[15] = 1
    uniformData[16] = uniforms.canvasWidth
    uniformData[17] = uniforms.canvasHeight
    uniformData[18] = 0 // lineWidth (unused)
    uniformData[19] = 1.0 // opacity
    uniformData[20] = 0; uniformData[21] = 0; uniformData[22] = 0; uniformData[23] = 1 // color (unused, per-bar)
    gpu.device.queue.writeBuffer(this.uniformBuffer, 0, uniformData)

    if (!this.pipeline) {
      const shaderModule = gpu.device.createShaderModule({ code: barShader })
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
    pass.draw(6, this.barCount)
    pass.end()
  }

  destroy(): void {
    this.dataBuffer.destroy()
  }
}
