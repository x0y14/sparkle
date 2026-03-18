import { describe, it, expect } from "vitest"
import { packXY, packOHLC } from "./packer"
import { createAccessor } from "./accessor"

describe("packXY", () => {
  it("オブジェクト配列をFloat32Arrayにパックする", () => {
    const acc = createAccessor([{ x: 100, y: 200 }, { x: 300, y: 400 }])
    const result = packXY(acc, 100, 200)
    expect(Array.from(result)).toEqual([0, 0, 200, 200])
  })

  it("startIndexから部分パックする", () => {
    const acc = createAccessor([{ x: 1, y: 10 }, { x: 2, y: 20 }, { x: 3, y: 30 }])
    const result = packXY(acc, 0, 0, 2)
    expect(Array.from(result)).toEqual([3, 30])
  })

  it("NaN値はそのまま保持される", () => {
    const acc = createAccessor([{ x: NaN, y: 1 }])
    const result = packXY(acc, 0, 0)
    expect(Number.isNaN(result[0])).toBe(true)
  })
})

describe("packOHLC", () => {
  it("OHLCデータを5値ストライドでパックする", () => {
    const acc = createAccessor([
      { time: 1000, open: 10, high: 15, low: 8, close: 12 },
    ])
    const result = packOHLC(acc, 1000, 0)
    expect(Array.from(result)).toEqual([0, 10, 15, 8, 12])
  })
})
