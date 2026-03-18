import { describe, it, expect } from "vitest"
import { createAccessor, detectFormat } from "./accessor"

describe("detectFormat", () => {
  it("オブジェクト配列を検出", () => { expect(detectFormat([{ x: 1, y: 2 }])).toBe("object") })
  it("タプル配列を検出", () => { expect(detectFormat([[1, 2]])).toBe("tuple") })
  it("列方向配列を検出", () => { expect(detectFormat({ x: [1], y: [2] })).toBe("columnar") })
  it("インターリーブを検出", () => { expect(detectFormat({ buffer: [1, 2], stride: 2 })).toBe("interleaved") })
  it("OHLCを検出", () => { expect(detectFormat([{ time: 1, open: 2, high: 3, low: 1, close: 2.5 }])).toBe("ohlc") })
  it("空配列はobjectを返す", () => { expect(detectFormat([])).toBe("object") })
})

describe("createAccessor - オブジェクト配列", () => {
  const acc = createAccessor([{ x: 10, y: 20 }, { x: 30, y: 40 }])
  it("getCount", () => { expect(acc.getCount()).toBe(2) })
  it("getX", () => { expect(acc.getX(0)).toBe(10); expect(acc.getX(1)).toBe(30) })
  it("getY", () => { expect(acc.getY(0)).toBe(20); expect(acc.getY(1)).toBe(40) })
  it("getBoundsX", () => { expect(acc.getBoundsX()).toEqual({ min: 10, max: 30 }) })
  it("getBoundsY", () => { expect(acc.getBoundsY()).toEqual({ min: 20, max: 40 }) })
  it("hasNull - NaN検出", () => {
    const acc2 = createAccessor([{ x: NaN, y: 1 }])
    expect(acc2.hasNull(0)).toBe(true)
  })
  it("hasNull - 正常値", () => { expect(acc.hasNull(0)).toBe(false) })
})

describe("createAccessor - タプル配列", () => {
  const acc = createAccessor([[5, 15], [25, 35]] as [number, number][])
  it("getX/getY", () => { expect(acc.getX(0)).toBe(5); expect(acc.getY(1)).toBe(35) })
  it("getBoundsX", () => { expect(acc.getBoundsX()).toEqual({ min: 5, max: 25 }) })
})

describe("createAccessor - 列方向配列", () => {
  const acc = createAccessor({ x: new Float64Array([1, 2, 3]), y: new Float64Array([10, 20, 30]) })
  it("getCount", () => { expect(acc.getCount()).toBe(3) })
  it("getX/getY", () => { expect(acc.getX(2)).toBe(3); expect(acc.getY(2)).toBe(30) })
})

describe("createAccessor - インターリーブ", () => {
  const acc = createAccessor({ buffer: new Float64Array([1, 10, 2, 20, 3, 30]), stride: 2 })
  it("getCount", () => { expect(acc.getCount()).toBe(3) })
  it("getX/getY", () => { expect(acc.getX(1)).toBe(2); expect(acc.getY(1)).toBe(20) })
})

describe("createAccessor - OHLC", () => {
  const data = [
    { time: 100, open: 10, high: 15, low: 8, close: 12 },
    { time: 200, open: 12, high: 20, low: 10, close: 18 },
  ]
  const acc = createAccessor(data)
  it("getOpen/getHigh/getLow/getClose", () => {
    expect(acc.getOpen(0)).toBe(10)
    expect(acc.getHigh(1)).toBe(20)
    expect(acc.getLow(0)).toBe(8)
    expect(acc.getClose(1)).toBe(18)
  })
  it("getBoundsY はlow-highの範囲", () => {
    expect(acc.getBoundsY()).toEqual({ min: 8, max: 20 })
  })
})
