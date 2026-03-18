import type { GPUContext, NormalizedSeries } from "../../types"
import type { ChartRenderer, RenderUniforms } from "./base-renderer"
import { BufferManager } from "../../data/buffer-manager"
import { hexToRGBA } from "../../config/color"
import pieShader from "../shaders/pie.wgsl?raw"

export interface PieSlice {
  startAngle: number
  endAngle: number
  innerRadius: number
  outerRadius: number
  r: number; g: number; b: number; a: number
}

export function computeSlices(series: NormalizedSeries[]): PieSlice[] {
  const values = series.map(s => s.accessor.getY(0))
  const total = values.reduce((sum, v) => sum + Math.abs(v), 0)
  if (total === 0) return []

  const slices: PieSlice[] = []
  let currentAngle = -Math.PI / 2 // start at 12 o'clock

  for (let i = 0; i < series.length; i++) {
    const angleSpan = (Math.abs(values[i]) / total) * Math.PI * 2
    const [r, g, b, a] = hexToRGBA(series[i].color)
    slices.push({
      startAngle: currentAngle,
      endAngle: currentAngle + angleSpan,
      innerRadius: series[i].innerRadius,
      outerRadius: series[i].outerRadius,
      r, g, b, a,
    })
    currentAngle += angleSpan
  }

  return slices
}

export class PieRenderer implements ChartRenderer {
  private pipeline: GPURenderPipeline | null = null
  private bindGroupLayout: GPUBindGroupLayout | null = null
  private dataBuffer: BufferManager
  private uniformBuffer: GPUBuffer
  private bindGroup: GPUBindGroup | null = null
  private sliceCount: number = 0
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

    const slices = computeSlices(series)
    this.sliceCount = slices.length

    const radiusPx = Math.min(uniforms.canvasWidth, uniforms.canvasHeight) * 0.4
    const centerX = uniforms.canvasWidth / 2
    const centerY = uniforms.canvasHeight / 2

    // Pack SliceInstance: startAngle, endAngle, innerRadius, outerRadius, color(vec4), center(vec2), maxRadius, _pad
    // = 12 floats per slice
    const sliceData = new Float32Array(slices.length * 12)
    for (let i = 0; i < slices.length; i++) {
      const s = slices[i]
      // Pass raw angles — shader handles wrapping via relative angle comparison
      sliceData[i * 12 + 0] = s.startAngle
      sliceData[i * 12 + 1] = s.endAngle
      sliceData[i * 12 + 2] = s.innerRadius * radiusPx
      sliceData[i * 12 + 3] = s.outerRadius * radiusPx
      sliceData[i * 12 + 4] = s.r
      sliceData[i * 12 + 5] = s.g
      sliceData[i * 12 + 6] = s.b
      sliceData[i * 12 + 7] = s.a
      sliceData[i * 12 + 8] = centerX
      sliceData[i * 12 + 9] = centerY
      sliceData[i * 12 + 10] = s.outerRadius * radiusPx
      sliceData[i * 12 + 11] = 0 // padding
    }
    this.dataBuffer.write(sliceData)

    // Uniform
    const uniformData = new Float32Array(32)
    // Identity transform (pie uses screen space)
    uniformData[0] = 1; uniformData[5] = 1; uniformData[10] = 1; uniformData[15] = 1
    uniformData[16] = uniforms.canvasWidth
    uniformData[17] = uniforms.canvasHeight
    uniformData[18] = 0
    uniformData[19] = 1.0 // opacity
    gpu.device.queue.writeBuffer(this.uniformBuffer, 0, uniformData)

    if (!this.pipeline) {
      const shaderModule = gpu.device.createShaderModule({ code: pieShader })
      this.bindGroupLayout = gpu.device.createBindGroupLayout({
        entries: [
          { binding: 0, visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, buffer: { type: "uniform" } },
          { binding: 1, visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, buffer: { type: "read-only-storage" } },
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
    if (!this.pipeline || !this.bindGroup || this.sliceCount === 0) return

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
    pass.draw(6, this.sliceCount)
    pass.end()
  }

  destroy(): void {
    this.dataBuffer.destroy()
  }
}
