export function nextPowerOf2(n: number): number {
  if (n <= 0) return 4
  n = Math.ceil(n)
  n--
  n |= n >> 1; n |= n >> 2; n |= n >> 4; n |= n >> 8; n |= n >> 16
  return n + 1
}

export function align4(n: number): number {
  return (n + 3) & ~3
}

export class BufferManager {
  private buffer: GPUBuffer | null = null
  private capacity: number = 0
  private usedBytes: number = 0
  private device: GPUDevice
  private usage: GPUBufferUsageFlags

  constructor(device: GPUDevice, usage: GPUBufferUsageFlags) {
    this.device = device
    this.usage = usage | GPUBufferUsage.COPY_DST
  }

  getBuffer(): GPUBuffer | null { return this.buffer }
  getUsedBytes(): number { return this.usedBytes }
  getCapacity(): number { return this.capacity }

  write(data: Float32Array): void {
    const bytes = align4(data.byteLength)
    if (bytes > this.capacity) {
      this.reallocate(bytes)
    }
    this.device.queue.writeBuffer(this.buffer!, 0, data as Float32Array<ArrayBuffer>)
    this.usedBytes = bytes
  }

  append(data: Float32Array): void {
    const newTotal = align4(this.usedBytes + data.byteLength)
    if (newTotal > this.capacity) {
      this.reallocate(newTotal)
    }
    this.device.queue.writeBuffer(this.buffer!, this.usedBytes, data as Float32Array<ArrayBuffer>)
    this.usedBytes = this.usedBytes + data.byteLength
  }

  needsRealloc(additionalBytes: number): boolean {
    return align4(this.usedBytes + additionalBytes) > this.capacity
  }

  private reallocate(minBytes: number): void {
    const newCap = nextPowerOf2(align4(minBytes))
    const newBuf = this.device.createBuffer({ size: newCap, usage: this.usage })
    if (this.buffer) {
      this.buffer.destroy()
    }
    this.buffer = newBuf
    this.capacity = newCap
    // usedBytes is NOT reset — callers (write/append) manage it
  }

  destroy(): void {
    if (this.buffer) {
      this.buffer.destroy()
    }
    this.buffer = null
    this.capacity = 0
    this.usedBytes = 0
  }
}
