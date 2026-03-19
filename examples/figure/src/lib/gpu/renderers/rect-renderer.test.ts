import { describe, it, expect } from "vitest"
import { packFiguresToFloat32, RectRenderer } from "./rect-renderer"
import { createMockGPUDevice } from "../../test-helpers"
import type { Figure } from "../../types"

describe("packFiguresToFloat32", () => {
  it("空配列で空Float32Arrayを返す", () => {
    expect(packFiguresToFloat32([]).length).toBe(0)
  })

  it("1図形で8floatを返す", () => {
    const fig: Figure = { id: "a", kind: "rect", x: 10, y: 20, width: 30, height: 40, fill: [0.5, 0.6, 0.7, 1] }
    const data = packFiguresToFloat32([fig])
    expect(data.length).toBe(8)
    expect(data[0]).toBe(10)
    expect(data[1]).toBe(20)
    expect(data[2]).toBe(30)
    expect(data[3]).toBe(40)
    expect(data[4]).toBeCloseTo(0.5)
    expect(data[5]).toBeCloseTo(0.6)
    expect(data[6]).toBeCloseTo(0.7)
    expect(data[7]).toBeCloseTo(1)
  })

  it("2図形で16floatを返す", () => {
    const figs: Figure[] = [
      { id: "a", kind: "rect", x: 0, y: 0, width: 10, height: 10, fill: [1,0,0,1] },
      { id: "b", kind: "rect", x: 50, y: 50, width: 20, height: 20, fill: [0,1,0,1] },
    ]
    const data = packFiguresToFloat32(figs)
    expect(data.length).toBe(16)
    expect(data[8]).toBe(50)
    expect(data[12]).toBeCloseTo(0)
    expect(data[13]).toBeCloseTo(1)
  })
})

describe("RectRenderer", () => {
  it("prepare + render が例外なく完了する", () => {
    const gpu = createMockGPUDevice()
    const renderer = new RectRenderer(gpu, 4)
    const fig: Figure = { id: "a", kind: "rect", x: 0, y: 0, width: 100, height: 100, fill: [1,0,0,1] }
    renderer.prepare(gpu, packFiguresToFloat32([fig]), 800, 600)
    const encoder = gpu.device.createCommandEncoder()
    renderer.render(encoder, {} as GPUTextureView, {} as GPUTextureView)
  })

  it("destroyが例外なく完了する", () => {
    const gpu = createMockGPUDevice()
    const renderer = new RectRenderer(gpu, 4)
    renderer.destroy()
  })
})
