import { describe, it, expect } from "vitest"
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
    mgr.write(new Float32Array([1, 2, 3]))  // 12 bytes → align4=12 → nextPow2=16
    expect(mgr.getBuffer()).not.toBeNull()
    expect(mgr.getCapacity()).toBe(16)
    expect(mgr.getUsedBytes()).toBe(12)
  })

  it("needsReallocが正しく判定する", () => {
    const { device } = createMockGPUDevice()
    const mgr = new BufferManager(device, GPUBufferUsage.VERTEX)
    mgr.write(new Float32Array([1, 2, 3, 4]))  // 16 bytes → cap=16
    expect(mgr.needsRealloc(0)).toBe(false)
    expect(mgr.needsRealloc(1)).toBe(true)
  })
})
