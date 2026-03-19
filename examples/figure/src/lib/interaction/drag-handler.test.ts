import { describe, it, expect } from "vitest"
import { beginDrag, moveDrag } from "./drag-handler"
import type { Figure } from "../types"

const fig: Figure = { id: "a", kind: "rect", x: 100, y: 80, width: 60, height: 40, fill: [1,0,0,1] }

describe("beginDrag", () => {
  it("初期状態を正しく記録する", () => {
    const state = beginDrag(fig, 120, 100)
    expect(state.figureId).toBe("a")
    expect(state.startMouseX).toBe(120)
    expect(state.startMouseY).toBe(100)
    expect(state.startFigureX).toBe(100)
    expect(state.startFigureY).toBe(80)
  })
})

describe("moveDrag", () => {
  const state = beginDrag(fig, 120, 100)

  it("マウス移動なしでは元の位置(スナップ済)を返す", () => {
    const pos = moveDrag(state, 120, 100)
    expect(pos).toEqual({ x: 100, y: 80 })
  })

  it("右下に25px移動→スナップされる", () => {
    const pos = moveDrag(state, 145, 125)
    expect(pos).toEqual({ x: 120, y: 100 })
  })

  it("左上に30px移動→スナップされる", () => {
    const pos = moveDrag(state, 90, 70)
    expect(pos).toEqual({ x: 80, y: 60 })
  })
})
