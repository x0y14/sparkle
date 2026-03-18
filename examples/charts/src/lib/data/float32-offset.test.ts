import { describe, it, expect } from "vitest"
import { computeOffset, applyOffset } from "./float32-offset"

describe("computeOffset", () => {
  it("空配列はオフセット0を返す", () => {
    expect(computeOffset([])).toBe(0)
  })

  it("最初の要素をオフセットとして返す", () => {
    expect(computeOffset([1710000000000, 1710000001000])).toBe(1710000000000)
  })
})

describe("applyOffset", () => {
  it("オフセットを引いた相対値のFloat32Arrayを返す", () => {
    const result = applyOffset([100, 200, 300], 100)
    expect(result).toBeInstanceOf(Float32Array)
    expect(Array.from(result)).toEqual([0, 100, 200])
  })

  it("大きな値でもオフセット後のfloat32精度が保たれる", () => {
    const base = 1710000000000
    const values = [base, base + 1, base + 1000]
    const offset = computeOffset(values)
    const result = applyOffset(values, offset)
    expect(result[0]).toBe(0)
    expect(result[1]).toBeCloseTo(1, 5)
    expect(result[2]).toBeCloseTo(1000, 5)
  })

  it("オフセットなしの大きな値はfloat32で精度が失われることを確認", () => {
    const base = 1710000000000
    const f32 = new Float32Array([base, base + 1])
    expect(f32[0]).toBe(f32[1])
  })
})
