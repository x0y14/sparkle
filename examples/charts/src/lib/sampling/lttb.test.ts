import { describe, it, expect } from "vitest"
import { lttb } from "./lttb"
import { createAccessor } from "../data/accessor"

describe("lttb", () => {
  it("target >= countなら全インデックスを返す", () => {
    const acc = createAccessor([{ x: 1, y: 1 }, { x: 2, y: 2 }])
    expect(lttb(acc, 5)).toEqual([0, 1])
  })

  it("先頭と末尾は常に含まれる", () => {
    const data = Array.from({ length: 100 }, (_, i) => ({ x: i, y: Math.sin(i / 10) }))
    const acc = createAccessor(data)
    const result = lttb(acc, 20)
    expect(result[0]).toBe(0)
    expect(result[result.length - 1]).toBe(99)
  })

  it("出力長がtargetCountと一致する", () => {
    const data = Array.from({ length: 1000 }, (_, i) => ({ x: i, y: Math.random() }))
    const acc = createAccessor(data)
    const result = lttb(acc, 50)
    expect(result).toHaveLength(50)
  })

  it("インデックスは昇順", () => {
    const data = Array.from({ length: 200 }, (_, i) => ({ x: i, y: Math.sin(i * 0.1) * 100 }))
    const acc = createAccessor(data)
    const result = lttb(acc, 30)
    for (let i = 1; i < result.length; i++) {
      expect(result[i]).toBeGreaterThan(result[i - 1])
    }
  })

  it("ピーク点が選択される（三角形面積が大きい点）", () => {
    const data = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 100 }, { x: 3, y: 0 }, { x: 4, y: 0 }]
    const acc = createAccessor(data)
    const result = lttb(acc, 3)
    expect(result).toContain(2)
  })
})
