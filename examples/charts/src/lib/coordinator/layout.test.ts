import { describe, it, expect } from "vitest"
import { computePlotRect, DEFAULT_MARGINS } from "./layout"

describe("computePlotRect", () => {
  it("標準マージンで正しいプロット領域を計算", () => {
    const r = computePlotRect(800, 600, DEFAULT_MARGINS)
    expect(r).toEqual({ x: 60, y: 20, width: 720, height: 540 })
  })

  it("ゼロマージンでキャンバス全体を返す", () => {
    const r = computePlotRect(800, 600, { top: 0, right: 0, bottom: 0, left: 0 })
    expect(r).toEqual({ x: 0, y: 0, width: 800, height: 600 })
  })

  it("マージンがキャンバスを超える場合はwidth/height=0", () => {
    const r = computePlotRect(100, 100, { top: 60, right: 60, bottom: 60, left: 60 })
    expect(r.width).toBe(0)
    expect(r.height).toBe(0)
  })
})
