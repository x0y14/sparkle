import { describe, it, expect } from "vitest"
import { beginLayoutDrag, moveLayoutDrag } from "../src/utils/drag-handler"

describe("beginLayoutDrag", () => {
  it("初期状態を正しく記録する", () => {
    const state = beginLayoutDrag("0", "a", 100, 200, 50, 150)
    expect(state.sourcePath).toBe("0")
    expect(state.sourceNodeId).toBe("a")
    expect(state.startMouseX).toBe(100)
    expect(state.startMouseY).toBe(200)
    expect(state.startElementX).toBe(50)
    expect(state.startElementY).toBe(150)
  })
})

describe("moveLayoutDrag", () => {
  const state = beginLayoutDrag("0", "a", 100, 200, 50, 150)

  it("マウス移動なしでは元の位置を返す", () => {
    expect(moveLayoutDrag(state, 100, 200)).toEqual({ x: 50, y: 150 })
  })
  it("右下に移動", () => {
    expect(moveLayoutDrag(state, 150, 230)).toEqual({ x: 100, y: 180 })
  })
  it("左上に移動", () => {
    expect(moveLayoutDrag(state, 80, 170)).toEqual({ x: 30, y: 120 })
  })
})
