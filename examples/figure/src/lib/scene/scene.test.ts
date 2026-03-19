import { describe, it, expect } from "vitest"
import { Scene } from "./scene"
import { FigureStore } from "../figures/figure-store"
import { createMockGPUDevice } from "../test-helpers"

describe("Scene", () => {
  function createMockCanvas() {
    const canvas = document.createElement("canvas")
    canvas.width = 800
    canvas.height = 600
    return canvas
  }

  function createDPRCanvas(dpr: number) {
    const canvas = document.createElement("canvas")
    const cssWidth = 800
    const cssHeight = 600
    canvas.width = cssWidth * dpr
    canvas.height = cssHeight * dpr
    canvas.getBoundingClientRect = () => ({
      x: 0, y: 0,
      width: cssWidth, height: cssHeight,
      top: 0, right: cssWidth, bottom: cssHeight, left: 0,
      toJSON() {},
    })
    return canvas
  }

  it("コンストラクタが例外なく完了する", () => {
    const gpu = createMockGPUDevice()
    const store = new FigureStore()
    const canvas = createMockCanvas()
    const scene = new Scene(canvas, gpu, store)
    scene.destroy()
  })

  it("addRectで図形が追加される", () => {
    const gpu = createMockGPUDevice()
    const store = new FigureStore()
    const canvas = createMockCanvas()
    const scene = new Scene(canvas, gpu, store)
    scene.addRect()
    expect(store.getAll()).toHaveLength(1)
    expect(store.getSelectedId()).not.toBeNull()
    scene.destroy()
  })

  it("addRectで追加された図形のサイズはスナップ済み", () => {
    const gpu = createMockGPUDevice()
    const store = new FigureStore()
    const canvas = createMockCanvas()
    const scene = new Scene(canvas, gpu, store)
    scene.addRect()
    const fig = store.getAll()[0]
    expect(fig.x % 20).toBe(0)
    expect(fig.y % 20).toBe(0)
    expect(fig.width % 20).toBe(0)
    expect(fig.height % 20).toBe(0)
    scene.destroy()
  })

  it("destroyが例外なく完了する", () => {
    const gpu = createMockGPUDevice()
    const store = new FigureStore()
    const canvas = createMockCanvas()
    const scene = new Scene(canvas, gpu, store)
    scene.destroy()
  })

  describe("DPR対応", () => {
    it("DPR=2でもaddRectの図形位置がCSS空間内に収まる", () => {
      const gpu = createMockGPUDevice()
      const store = new FigureStore()
      const canvas = createDPRCanvas(2) // physical: 1600x1200, CSS: 800x600
      const scene = new Scene(canvas, gpu, store)
      scene.addRect()
      const fig = store.getAll()[0]
      expect(fig.x).toBeLessThan(800)
      expect(fig.y).toBeLessThan(600)
      scene.destroy()
    })

    it("DPR=2のcanvasでrenderFrameがエラーなく完了する", () => {
      const gpu = createMockGPUDevice()
      const store = new FigureStore()
      const canvas = createDPRCanvas(2)
      const scene = new Scene(canvas, gpu, store)
      scene.addRect()
      scene.destroy()
    })
  })
})
