import { describe, it, expect } from "vitest"
import { GridRenderer, computeGridLines } from "./grid-renderer"
import { createMockGPUDevice } from "../../test-helpers"
import { createLinearScale } from "../../scales/linear-scale"
import { normalizeConfig } from "../../config/normalize"

describe("computeGridLines", () => {
  it("tick 位置からグリッド線の座標を生成する", () => {
    const scaleX = createLinearScale(0, 100, -1, 1)
    const scaleY = createLinearScale(0, 100, -1, 1)
    const plotRect = { x: 60, y: 20, width: 720, height: 360 }
    const lines = computeGridLines(scaleX, scaleY, plotRect, 800, 400, 8, 8)
    expect(lines.length).toBeGreaterThan(0)
    expect(lines.length % 4).toBe(0)
  })
})

describe("GridRenderer", () => {
  const gpu = createMockGPUDevice()

  it("prepareGrid + render が例外なく完了する", () => {
    const renderer = new GridRenderer(gpu, 4)
    const config = normalizeConfig({
      type: "line",
      series: [{ data: [{ x: 0, y: 0 }, { x: 100, y: 100 }], label: "test" }],
    })
    const scaleX = createLinearScale(0, 100, -1, 1)
    const scaleY = createLinearScale(0, 100, -1, 1)
    renderer.prepareGrid(gpu, config, scaleX, scaleY, { x: 60, y: 20, width: 720, height: 360 }, 800, 400)

    const encoder = gpu.device.createCommandEncoder()
    renderer.render(encoder, {} as GPUTextureView, {} as GPUTextureView)
  })
})
