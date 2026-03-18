import { describe, it, expect } from "vitest"
import { createLinearScale } from "./linear-scale"

describe("createLinearScale", () => {
  it("domain [0,100] → range [-1,1]: 0→-1, 50→0, 100→1", () => {
    const s = createLinearScale(0, 100, -1, 1)
    expect(s.map(0)).toBe(-1)
    expect(s.map(50)).toBeCloseTo(0)
    expect(s.map(100)).toBe(1)
  })

  it("invert: range値からdomain値に戻す", () => {
    const s = createLinearScale(0, 100, -1, 1)
    expect(s.invert(-1)).toBe(0)
    expect(s.invert(0)).toBeCloseTo(50)
    expect(s.invert(1)).toBe(100)
  })

  it("domain幅が0の場合はrange中央を返す", () => {
    const s = createLinearScale(50, 50, -1, 1)
    expect(s.map(50)).toBe(0)
  })

  it("反転range: rangeMin > rangeMaxでも正しく変換", () => {
    const s = createLinearScale(0, 100, 1, -1)
    expect(s.map(0)).toBe(1)
    expect(s.map(100)).toBe(-1)
  })

  it("ticks: 適切な間隔のティック値を返す", () => {
    const s = createLinearScale(0, 100, 0, 800)
    const t = s.ticks(5)
    expect(t.length).toBeGreaterThanOrEqual(3)
    expect(t[0]).toBeGreaterThanOrEqual(0)
    expect(t[t.length - 1]).toBeLessThanOrEqual(100)
    if (t.length > 1) {
      const step = t[1] - t[0]
      for (let i = 2; i < t.length; i++) {
        expect(t[i] - t[i - 1]).toBeCloseTo(step)
      }
    }
  })
})
