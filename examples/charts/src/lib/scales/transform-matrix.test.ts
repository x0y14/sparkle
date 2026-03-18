import { describe, it, expect } from "vitest"
import { buildTransformMatrix } from "./transform-matrix"

function applyMatrix(m: Float32Array, x: number, y: number): [number, number] {
  const rx = m[0] * x + m[4] * y + m[8] * 0 + m[12]
  const ry = m[1] * x + m[5] * y + m[9] * 0 + m[13]
  return [rx, ry]
}

describe("buildTransformMatrix", () => {
  it("プロット領域が全体の場合、domain端がclip [-1,1]に対応", () => {
    const m = buildTransformMatrix(0, 100, 0, 50, { x: 0, y: 0, width: 800, height: 600 }, 800, 600, 0, 0)
    const [x0, y0] = applyMatrix(m, 0, 0)
    const [x1, y1] = applyMatrix(m, 100, 50)
    expect(x0).toBeCloseTo(-1)
    expect(y0).toBeCloseTo(-1)
    expect(x1).toBeCloseTo(1)
    expect(y1).toBeCloseTo(1)
  })

  it("オフセット適用: data=offset+relativeで正しくマッピング", () => {
    const offset = 1710000000000
    const m = buildTransformMatrix(offset, offset + 1000, 0, 100,
      { x: 0, y: 0, width: 800, height: 600 }, 800, 600, offset, 0)
    const [x0] = applyMatrix(m, 0, 0)
    const [x1] = applyMatrix(m, 1000, 0)
    expect(x0).toBeCloseTo(-1)
    expect(x1).toBeCloseTo(1)
  })

  it("マージン付きプロット領域でクリップ範囲が狭まる", () => {
    const m = buildTransformMatrix(0, 100, 0, 100,
      { x: 100, y: 50, width: 600, height: 500 }, 800, 600, 0, 0)
    const [x0] = applyMatrix(m, 0, 0)
    const [x1] = applyMatrix(m, 100, 100)
    expect(x0).toBeCloseTo(-0.75)
    expect(x1).toBeCloseTo(0.75)
  })
})
