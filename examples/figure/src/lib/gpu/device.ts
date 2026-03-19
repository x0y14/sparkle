import type { GPUContext } from "../types"

let cachedDevice: GPUDevice | null = null

export async function getGPUDevice(): Promise<GPUDevice> {
  if (cachedDevice) return cachedDevice
  if (!navigator.gpu) throw new Error("WebGPU is not supported")
  const adapter = await navigator.gpu.requestAdapter()
  if (!adapter) throw new Error("No GPU adapter found")
  cachedDevice = await adapter.requestDevice()
  cachedDevice.lost.then(() => { cachedDevice = null })
  return cachedDevice
}

export function initGPUContext(canvas: HTMLCanvasElement, device: GPUDevice): GPUContext {
  const context = canvas.getContext("webgpu")!
  const format = navigator.gpu.getPreferredCanvasFormat()
  context.configure({ device, format, alphaMode: "premultiplied" })
  return { device, context, format }
}
