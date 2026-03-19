import { describe, it, expect } from "vitest"
import { packSelectionToFloat32, OUTLINE_WIDTH, HANDLE_SIZE, SelectionRenderer } from "./selection-renderer"
import { createMockGPUDevice } from "../../test-helpers"
import type { Figure } from "../../types"

const fig: Figure = { id: "a", kind: "rect", x: 20, y: 30, width: 100, height: 80, fill: [1,0,0,1] }

describe("packSelectionToFloat32", () => {
  const data = packSelectionToFloat32(fig)

  it("8インスタンス × 8float = 64floatを返す", () => {
    expect(data.length).toBe(64)
  })

  it("最初の4インスタンスはアウトライン(白色)", () => {
    for (let i = 0; i < 4; i++) {
      expect(data[i * 8 + 4]).toBe(1)
      expect(data[i * 8 + 5]).toBe(1)
      expect(data[i * 8 + 6]).toBe(1)
      expect(data[i * 8 + 7]).toBe(1)
    }
  })

  it("topアウトライン: (20, 30, 100, 2)", () => {
    expect(data[0]).toBe(20)
    expect(data[1]).toBe(30)
    expect(data[2]).toBe(100)
    expect(data[3]).toBe(OUTLINE_WIDTH)
  })

  it("bottomアウトライン: (20, 108, 100, 2)", () => {
    expect(data[8]).toBe(20)
    expect(data[9]).toBe(108)
    expect(data[10]).toBe(100)
    expect(data[11]).toBe(OUTLINE_WIDTH)
  })

  it("leftアウトライン: (20, 30, 2, 80)", () => {
    expect(data[16]).toBe(20)
    expect(data[17]).toBe(30)
    expect(data[18]).toBe(OUTLINE_WIDTH)
    expect(data[19]).toBe(80)
  })

  it("rightアウトライン: (118, 30, 2, 80)", () => {
    expect(data[24]).toBe(118)
    expect(data[25]).toBe(30)
    expect(data[26]).toBe(OUTLINE_WIDTH)
    expect(data[27]).toBe(80)
  })

  it("topハンドル: 上辺中央", () => {
    expect(data[32]).toBe(66)
    expect(data[33]).toBe(26)
    expect(data[34]).toBe(HANDLE_SIZE)
    expect(data[35]).toBe(HANDLE_SIZE)
  })

  it("rightハンドル: 右辺中央", () => {
    expect(data[40]).toBe(116)
    expect(data[41]).toBe(66)
    expect(data[42]).toBe(HANDLE_SIZE)
    expect(data[43]).toBe(HANDLE_SIZE)
  })

  it("bottomハンドル: 下辺中央", () => {
    expect(data[48]).toBe(66)
    expect(data[49]).toBe(106)
  })

  it("leftハンドル: 左辺中央", () => {
    expect(data[56]).toBe(16)
    expect(data[57]).toBe(66)
  })
})

describe("SelectionRenderer", () => {
  it("prepare + render が例外なく完了する", () => {
    const gpu = createMockGPUDevice()
    const renderer = new SelectionRenderer(gpu, 4)
    renderer.prepare(gpu, packSelectionToFloat32(fig), 800, 600)
    const encoder = gpu.device.createCommandEncoder()
    renderer.render(encoder, {} as GPUTextureView, {} as GPUTextureView)
  })

  it("空データでrenderが例外なく完了する", () => {
    const gpu = createMockGPUDevice()
    const renderer = new SelectionRenderer(gpu, 4)
    renderer.prepare(gpu, new Float32Array(0), 800, 600)
    const encoder = gpu.device.createCommandEncoder()
    renderer.render(encoder, {} as GPUTextureView, {} as GPUTextureView)
  })
})
