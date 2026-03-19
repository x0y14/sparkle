import { describe, it, expect } from "vitest"
import { hitTest, HANDLE_SIZE } from "./hit-test"
import type { Figure } from "../types"

const fig1: Figure = { id: "a", kind: "rect", x: 100, y: 100, width: 100, height: 80, fill: [1,0,0,1] }
const fig2: Figure = { id: "b", kind: "rect", x: 150, y: 130, width: 100, height: 80, fill: [0,1,0,1] }

describe("hitTest", () => {
  it("図形なしでcanvasを返す", () => {
    expect(hitTest([], null, 50, 50)).toEqual({ kind: "canvas" })
  })

  it("図形内部をクリックでfigureを返す", () => {
    expect(hitTest([fig1], null, 150, 140)).toEqual({ kind: "figure", figureId: "a" })
  })

  it("図形外部でcanvasを返す", () => {
    expect(hitTest([fig1], null, 50, 50)).toEqual({ kind: "canvas" })
  })

  it("重なりでは後ろ(z-order上位)の図形が優先される", () => {
    const result = hitTest([fig1, fig2], null, 170, 150)
    expect(result).toEqual({ kind: "figure", figureId: "b" })
  })

  it("選択図形のtopハンドルにヒットする", () => {
    const result = hitTest([fig1], "a", 150, 100)
    expect(result).toEqual({ kind: "handle", figureId: "a", side: "top" })
  })

  it("選択図形のrightハンドルにヒットする", () => {
    const result = hitTest([fig1], "a", 200, 140)
    expect(result).toEqual({ kind: "handle", figureId: "a", side: "right" })
  })

  it("選択図形のbottomハンドルにヒットする", () => {
    const result = hitTest([fig1], "a", 150, 180)
    expect(result).toEqual({ kind: "handle", figureId: "a", side: "bottom" })
  })

  it("選択図形のleftハンドルにヒットする", () => {
    const result = hitTest([fig1], "a", 100, 140)
    expect(result).toEqual({ kind: "handle", figureId: "a", side: "left" })
  })

  it("ハンドルは図形本体より優先される", () => {
    const result = hitTest([fig1], "a", 150, 100)
    expect(result.kind).toBe("handle")
  })

  it("非選択図形のハンドルはチェックされない", () => {
    const result = hitTest([fig1], null, 150, 100)
    expect(result).toEqual({ kind: "figure", figureId: "a" })
  })
})
