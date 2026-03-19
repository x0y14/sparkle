export class MSAAManager {
  private msaaTexture: GPUTexture | null = null
  private resolveTexture: GPUTexture | null = null
  private device: GPUDevice
  private sampleCount: number
  private format: GPUTextureFormat
  private width: number = 0
  private height: number = 0

  constructor(device: GPUDevice, format: GPUTextureFormat, sampleCount: number = 4) {
    this.device = device
    this.format = format
    this.sampleCount = sampleCount
  }

  ensure(width: number, height: number): { msaaView: GPUTextureView; resolveView: GPUTextureView; resolveTexture: GPUTexture } {
    if (this.width !== width || this.height !== height) {
      this.msaaTexture?.destroy()
      this.resolveTexture?.destroy()
      this.msaaTexture = this.device.createTexture({
        size: { width, height },
        format: this.format,
        sampleCount: this.sampleCount,
        usage: GPUTextureUsage.RENDER_ATTACHMENT,
      })
      this.resolveTexture = this.device.createTexture({
        size: { width, height },
        format: this.format,
        sampleCount: 1,
        usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
      })
      this.width = width
      this.height = height
    }
    return {
      msaaView: this.msaaTexture!.createView(),
      resolveView: this.resolveTexture!.createView(),
      resolveTexture: this.resolveTexture!,
    }
  }

  getResolveTexture(): GPUTexture | null {
    return this.resolveTexture
  }

  destroy(): void {
    this.msaaTexture?.destroy()
    this.resolveTexture?.destroy()
    this.msaaTexture = null
    this.resolveTexture = null
  }
}
