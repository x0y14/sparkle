if (typeof globalThis.GPUBufferUsage === "undefined") {
  (globalThis as any).GPUBufferUsage = {
    MAP_READ: 0x0001, MAP_WRITE: 0x0002, COPY_SRC: 0x0004,
    COPY_DST: 0x0008, INDEX: 0x0010, VERTEX: 0x0020,
    UNIFORM: 0x0040, STORAGE: 0x0080, INDIRECT: 0x0100,
    QUERY_RESOLVE: 0x0200,
  }
  ;(globalThis as any).GPUTextureUsage = {
    COPY_SRC: 0x01, COPY_DST: 0x02, TEXTURE_BINDING: 0x04,
    STORAGE_BINDING: 0x08, RENDER_ATTACHMENT: 0x10,
  }
  ;(globalThis as any).GPUShaderStage = {
    VERTEX: 0x1, FRAGMENT: 0x2, COMPUTE: 0x4,
  }
}

import type { GPUContext } from "./types"

export function createMockGPUDevice(): GPUContext {
  const device = {
    createBuffer(desc: GPUBufferDescriptor): GPUBuffer {
      const buf = { size: desc.size, usage: desc.usage, mapState: "unmapped", label: desc.label, destroy() {} } as unknown as GPUBuffer
      return buf
    },
    createShaderModule(_desc: GPUShaderModuleDescriptor) {
      return {} as GPUShaderModule
    },
    createRenderPipeline(_desc: GPURenderPipelineDescriptor) {
      return {} as GPURenderPipeline
    },
    createComputePipeline(_desc: GPUComputePipelineDescriptor) {
      return {} as GPUComputePipeline
    },
    createBindGroup(_desc: GPUBindGroupDescriptor) {
      return {} as GPUBindGroup
    },
    createBindGroupLayout(_desc: GPUBindGroupLayoutDescriptor) {
      return {} as GPUBindGroupLayout
    },
    createPipelineLayout(_desc: GPUPipelineLayoutDescriptor) {
      return {} as GPUPipelineLayout
    },
    createTexture(desc: GPUTextureDescriptor) {
      return {
        createView() { return {} as GPUTextureView },
        width: (desc.size as GPUExtent3DDict).width,
        height: (desc.size as GPUExtent3DDict).height,
        destroy() {},
      } as unknown as GPUTexture
    },
    createSampler(_desc?: GPUSamplerDescriptor) {
      return {} as GPUSampler
    },
    createCommandEncoder() {
      const passes: unknown[] = []
      return {
        beginRenderPass(_desc: GPURenderPassDescriptor) {
          const pass = {
            setPipeline() {},
            setVertexBuffer() {},
            setBindGroup() {},
            draw() {},
            drawIndexed() {},
            end() {},
          }
          passes.push(pass)
          return pass as unknown as GPURenderPassEncoder
        },
        beginComputePass() {
          const pass = {
            setPipeline() {},
            setBindGroup() {},
            dispatchWorkgroups() {},
            end() {},
          }
          passes.push(pass)
          return pass as unknown as GPUComputePassEncoder
        },
        copyTextureToTexture() {},
        finish() { return {} as GPUCommandBuffer },
      } as unknown as GPUCommandEncoder
    },
    queue: {
      writeBuffer(_buf: GPUBuffer, _offset: number, _data: BufferSource) {},
      submit(_cmds: GPUCommandBuffer[]) {},
    },
    destroy() {},
  } as unknown as GPUDevice

  const context = {
    configure() {},
    getCurrentTexture() {
      return {
        createView() { return {} as GPUTextureView },
        width: 800,
        height: 600,
      } as unknown as GPUTexture
    },
  } as unknown as GPUCanvasContext

  return { device, context, format: "bgra8unorm" as GPUTextureFormat }
}
