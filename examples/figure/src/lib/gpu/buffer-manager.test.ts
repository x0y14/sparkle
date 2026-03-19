import { describe, it, expect, vi } from "vitest"
import { nextPowerOf2, align4, BufferManager } from "./buffer-manager"
import { createMockGPUDevice } from "../test-helpers"

describe("nextPowerOf2", () => {
  it("0以下は4を返す", () => { expect(nextPowerOf2(0)).toBe(4) })
  it("1は1", () => { expect(nextPowerOf2(1)).toBe(1) })
  it("3は4", () => { expect(nextPowerOf2(3)).toBe(4) })
  it("4は4", () => { expect(nextPowerOf2(4)).toBe(4) })
  it("5は8", () => { expect(nextPowerOf2(5)).toBe(8) })
  it("100は128", () => { expect(nextPowerOf2(100)).toBe(128) })
})

describe("align4", () => {
  it("0は0", () => { expect(align4(0)).toBe(0) })
  it("1は4", () => { expect(align4(1)).toBe(4) })
  it("4は4", () => { expect(align4(4)).toBe(4) })
  it("5は8", () => { expect(align4(5)).toBe(8) })
})

describe("BufferManager", () => {
  it("初期状態はバッファなし", () => {
    const { device } = createMockGPUDevice()
    const mgr = new BufferManager(device, GPUBufferUsage.VERTEX)
    expect(mgr.getBuffer()).toBeNull()
    expect(mgr.getUsedBytes()).toBe(0)
    expect(mgr.getCapacity()).toBe(0)
  })

  it("writeで2のべき乗容量のバッファが作られる", () => {
    const { device } = createMockGPUDevice()
    const mgr = new BufferManager(device, GPUBufferUsage.VERTEX)
    mgr.write(new Float32Array([1, 2, 3]))
    expect(mgr.getBuffer()).not.toBeNull()
    expect(mgr.getCapacity()).toBe(16)
    expect(mgr.getUsedBytes()).toBe(12)
  })

  it("needsReallocが正しく判定する", () => {
    const { device } = createMockGPUDevice()
    const mgr = new BufferManager(device, GPUBufferUsage.VERTEX)
    mgr.write(new Float32Array([1, 2, 3, 4]))
    expect(mgr.needsRealloc(0)).toBe(false)
    expect(mgr.needsRealloc(1)).toBe(true)
  })

  it("reallocate 時に旧バッファの destroy が呼ばれる", () => {
    const { device } = createMockGPUDevice()
    const destroySpy = vi.fn()
    const origCreateBuffer = device.createBuffer.bind(device)
    device.createBuffer = (desc: GPUBufferDescriptor) => {
      const buf = origCreateBuffer(desc)
      buf.destroy = destroySpy
      return buf
    }
    const mgr = new BufferManager(device, GPUBufferUsage.VERTEX)
    mgr.write(new Float32Array([1]))
    const oldDestroyCalls = destroySpy.mock.calls.length
    mgr.write(new Float32Array([1, 2, 3, 4, 5]))
    expect(destroySpy.mock.calls.length).toBe(oldDestroyCalls + 1)
  })

  it("append がデータを末尾に追加し usedBytes を累積する", () => {
    const { device } = createMockGPUDevice()
    const mgr = new BufferManager(device, GPUBufferUsage.VERTEX)
    mgr.write(new Float32Array([1, 2]))
    mgr.append(new Float32Array([3, 4]))
    expect(mgr.getUsedBytes()).toBe(16)
  })

  it("append 中の realloc で usedBytes が正しく累積される", () => {
    const { device } = createMockGPUDevice()
    const mgr = new BufferManager(device, GPUBufferUsage.VERTEX)
    mgr.write(new Float32Array([1, 2, 3, 4]))
    mgr.append(new Float32Array([5, 6, 7, 8]))
    expect(mgr.getUsedBytes()).toBe(32)
  })

  it("append が容量超過時に realloc する", () => {
    const { device } = createMockGPUDevice()
    const mgr = new BufferManager(device, GPUBufferUsage.VERTEX)
    mgr.write(new Float32Array([1]))
    mgr.append(new Float32Array([2, 3]))
    expect(mgr.getCapacity()).toBeGreaterThan(4)
  })

  it("destroy が GPUBuffer.destroy を呼ぶ", () => {
    const { device } = createMockGPUDevice()
    const destroySpy = vi.fn()
    const origCreateBuffer = device.createBuffer.bind(device)
    device.createBuffer = (desc: GPUBufferDescriptor) => {
      const buf = origCreateBuffer(desc)
      buf.destroy = destroySpy
      return buf
    }
    const mgr = new BufferManager(device, GPUBufferUsage.VERTEX)
    mgr.write(new Float32Array([1]))
    mgr.destroy()
    expect(destroySpy).toHaveBeenCalled()
  })

  it("destroy 後に getBuffer() が null を返す", () => {
    const { device } = createMockGPUDevice()
    const mgr = new BufferManager(device, GPUBufferUsage.VERTEX)
    mgr.write(new Float32Array([1]))
    mgr.destroy()
    expect(mgr.getBuffer()).toBeNull()
  })
})
