import { describe, it, expect } from "vitest"
import { containsPoint, computeHandles, handleContainsPoint } from "./rect"

describe("containsPoint", () => {
  const rect = { x: 20, y: 30, width: 100, height: 80 }
  it("内部の点はtrue", () => { expect(containsPoint(rect, 50, 50)).toBe(true) })
  it("外部の点はfalse", () => { expect(containsPoint(rect, 0, 0)).toBe(false) })
  it("左上角はtrue", () => { expect(containsPoint(rect, 20, 30)).toBe(true) })
  it("右下角はtrue", () => { expect(containsPoint(rect, 120, 110)).toBe(true) })
  it("右外はfalse", () => { expect(containsPoint(rect, 121, 50)).toBe(false) })
  it("下外はfalse", () => { expect(containsPoint(rect, 50, 111)).toBe(false) })
})

describe("computeHandles", () => {
  const rect = { x: 20, y: 30, width: 100, height: 80 }
  const handles = computeHandles(rect, 8)

  it("4つのハンドルを返す", () => { expect(handles).toHaveLength(4) })
  it("top: 上辺中央", () => {
    const h = handles.find(h => h.side === "top")!
    expect(h.cx).toBe(70)
    expect(h.cy).toBe(30)
  })
  it("right: 右辺中央", () => {
    const h = handles.find(h => h.side === "right")!
    expect(h.cx).toBe(120)
    expect(h.cy).toBe(70)
  })
  it("bottom: 下辺中央", () => {
    const h = handles.find(h => h.side === "bottom")!
    expect(h.cx).toBe(70)
    expect(h.cy).toBe(110)
  })
  it("left: 左辺中央", () => {
    const h = handles.find(h => h.side === "left")!
    expect(h.cx).toBe(20)
    expect(h.cy).toBe(70)
  })
})

describe("handleContainsPoint", () => {
  it("ハンドル中心はtrue", () => { expect(handleContainsPoint(50, 50, 8, 50, 50)).toBe(true) })
  it("ハンドル範囲内はtrue", () => { expect(handleContainsPoint(50, 50, 8, 53, 53)).toBe(true) })
  it("ハンドル範囲外はfalse", () => { expect(handleContainsPoint(50, 50, 8, 55, 55)).toBe(false) })
  it("ハンドル端はtrue", () => { expect(handleContainsPoint(50, 50, 8, 54, 54)).toBe(true) })
})
