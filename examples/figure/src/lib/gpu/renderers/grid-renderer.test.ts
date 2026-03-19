import { describe, it, expect } from "vitest"
import { computeGridLines, GridRenderer } from "./grid-renderer"
import { createMockGPUDevice } from "../../test-helpers"

describe("computeGridLines", () => {
  it("100x80, gridSize=20 で正しい線数を生成する", () => {
    const lines = computeGridLines(100, 80, 20)
    // vertical: x=20, 40, 60, 80 → 4本
    // horizontal: y=20, 40, 60 → 3本
    // 各4floats → (4+3)*4 = 28
    expect(lines.length).toBe(28)
  })

  it("各線は4floatで構成される", () => {
    const lines = computeGridLines(100, 80, 20)
    expect(lines.length % 4).toBe(0)
  })

  it("垂直線はx座標が一致する", () => {
    const lines = computeGridLines(100, 80, 20)
    expect(lines[0]).toBe(20)
    expect(lines[1]).toBe(0)
    expect(lines[2]).toBe(20)
    expect(lines[3]).toBe(80)
  })

  it("gridSize=0では空配列を返す", () => {
    const lines = computeGridLines(100, 80, 0)
    expect(lines.length).toBe(0)
  })
})

describe("GridRenderer", () => {
  it("prepare + render が例外なく完了する", () => {
    const gpu = createMockGPUDevice()
    const renderer = new GridRenderer(gpu, 4)
    const data = computeGridLines(800, 600, 20)
    renderer.prepare(gpu, data, 800, 600)
    const encoder = gpu.device.createCommandEncoder()
    renderer.render(encoder, {} as GPUTextureView, {} as GPUTextureView)
  })

  it("空データではrenderがdrawを呼ばない", () => {
    const gpu = createMockGPUDevice()
    const renderer = new GridRenderer(gpu, 4)
    renderer.prepare(gpu, new Float32Array(0), 800, 600)
    const encoder = gpu.device.createCommandEncoder()
    renderer.render(encoder, {} as GPUTextureView, {} as GPUTextureView)
  })

  it("destroyが例外なく完了する", () => {
    const gpu = createMockGPUDevice()
    const renderer = new GridRenderer(gpu, 4)
    renderer.destroy()
  })
})
