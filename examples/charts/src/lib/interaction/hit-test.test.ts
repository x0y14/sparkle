import { describe, it, expect } from "vitest"
import { hitTestBinarySearch, hitTestBar, hitTestPie } from "./hit-test"
import { createAccessor } from "../data/accessor"

describe("hitTestBinarySearch", () => {
  const data = Array.from({ length: 100 }, (_, i) => ({ x: i * 10, y: i * 5 }))
  const acc = createAccessor(data)
  const plot = { x: 0, y: 0, width: 800, height: 600 }

  it("正確な座標で対応するインデックスを返す", () => {
    const idx = hitTestBinarySearch(500, 250, acc, 50, plot, 0, 990, 0, 495)
    expect(idx).toBe(50)
  })

  it("閾値外はnullを返す", () => {
    const idx = hitTestBinarySearch(500, 1000, acc, 10, plot, 0, 990, 0, 495)
    expect(idx).toBeNull()
  })

  it("空データはnullを返す", () => {
    const emptyAcc = createAccessor([])
    expect(hitTestBinarySearch(0, 0, emptyAcc, 50, plot, 0, 1, 0, 1)).toBeNull()
  })

  it("先頭要素にヒットする", () => {
    const idx = hitTestBinarySearch(0, 0, acc, 50, plot, 0, 990, 0, 495)
    expect(idx).toBe(0)
  })

  it("末尾要素にヒットする", () => {
    const idx = hitTestBinarySearch(990, 495, acc, 50, plot, 0, 990, 0, 495)
    expect(idx).toBe(99)
  })

  it("maxDistancePx 外なら null", () => {
    // Far away from any point
    const idx = hitTestBinarySearch(500, -10000, acc, 5, plot, 0, 990, 0, 495)
    expect(idx).toBeNull()
  })
})

describe("hitTestBar", () => {
  const rects = [
    { x: 10, y: 100, width: 30, height: 200 },
    { x: 50, y: 150, width: 30, height: 150 },
  ]

  it("バー内部はインデックスを返す", () => { expect(hitTestBar(25, 200, rects)).toBe(0) })
  it("バー外部はnullを返す", () => { expect(hitTestBar(45, 200, rects)).toBeNull() })
})

describe("hitTestPie", () => {
  const slices = [
    { startAngle: 0, endAngle: Math.PI, innerRadius: 0, outerRadius: 100 },
    { startAngle: Math.PI, endAngle: 2 * Math.PI, innerRadius: 0, outerRadius: 100 },
  ]

  it("範囲外→null", () => { expect(hitTestPie(150, 0, 0, 0, slices)).toBe(null) })
  it("右下→スライス0", () => { expect(hitTestPie(50, 50, 0, 0, slices)).toBe(0) })
  it("右上→スライス1 (atan2で2PI近くに正規化)", () => { expect(hitTestPie(50, -50, 0, 0, slices)).toBe(1) })

  it("角度境界上のポイントがヒットする", () => {
    // angle === 0 is exactly the start of slice 0
    expect(hitTestPie(50, 0, 0, 0, slices)).toBe(0)
  })
})
