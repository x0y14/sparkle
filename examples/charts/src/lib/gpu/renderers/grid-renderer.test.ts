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

  it("水平線と垂直線の両方を生成する", () => {
    const scaleX = createLinearScale(0, 200, -1, 1)
    const scaleY = createLinearScale(0, 200, -1, 1)
    const plotRect = { x: 0, y: 0, width: 800, height: 600 }
    const lines = computeGridLines(scaleX, scaleY, plotRect, 800, 600, 5, 5)
    // Parse lines into pairs
    const verticalLines: number[] = []
    const horizontalLines: number[] = []
    for (let i = 0; i < lines.length; i += 4) {
      const x0 = lines[i], y0 = lines[i + 1], x1 = lines[i + 2], y1 = lines[i + 3]
      if (Math.abs(x0 - x1) < 0.001) verticalLines.push(x0)   // same x → vertical
      if (Math.abs(y0 - y1) < 0.001) horizontalLines.push(y0)  // same y → horizontal
    }
    expect(verticalLines.length).toBeGreaterThan(0)
    expect(horizontalLines.length).toBeGreaterThan(0)
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
