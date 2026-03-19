import { describe, it, expect } from "vitest"
import { beginResize, moveResize } from "./resize-handler"
import { GRID_SIZE } from "./snap"
import type { Figure } from "../types"

const fig: Figure = { id: "a", kind: "rect", x: 100, y: 100, width: 100, height: 80, fill: [1,0,0,1] }

describe("moveResize", () => {
  it("right: 右辺を30px右に → 幅が増える", () => {
    const state = beginResize(fig, "right", 200, 140)
    const r = moveResize(state, 230, 140)
    expect(r.x).toBe(100)
    expect(r.y).toBe(100)
    expect(r.width).toBe(140)
    expect(r.height).toBe(80)
  })

  it("left: 左辺を30px左に → 幅が増え、xが減る", () => {
    const state = beginResize(fig, "left", 100, 140)
    const r = moveResize(state, 70, 140)
    expect(r.width).toBe(120)
    expect(r.x).toBe(80)
    expect(r.y).toBe(100)
    expect(r.height).toBe(80)
  })

  it("top: 上辺を25px上に → 高さが増え、yが減る", () => {
    const state = beginResize(fig, "top", 150, 100)
    const r = moveResize(state, 150, 75)
    expect(r.height).toBe(100)
    expect(r.y).toBe(80)
    expect(r.x).toBe(100)
    expect(r.width).toBe(100)
  })

  it("bottom: 下辺を30px下に → 高さが増える", () => {
    const state = beginResize(fig, "bottom", 150, 180)
    const r = moveResize(state, 150, 210)
    expect(r.height).toBe(120)
    expect(r.y).toBe(100)
    expect(r.x).toBe(100)
    expect(r.width).toBe(100)
  })

  it("最小サイズはGRID_SIZE", () => {
    const state = beginResize(fig, "right", 200, 140)
    const r = moveResize(state, 110, 140)
    expect(r.width).toBe(GRID_SIZE)
  })

  it("top: 最小サイズ制約", () => {
    const state = beginResize(fig, "top", 150, 100)
    const r = moveResize(state, 150, 175)
    expect(r.height).toBe(GRID_SIZE)
  })
})
