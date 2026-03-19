import { describe, it, expect } from "vitest"
import { createClipboard, copyFigure, pasteFigure } from "./clipboard"
import type { Figure } from "../types"

const fig: Figure = { id: "a", kind: "rect", x: 100, y: 80, width: 60, height: 40, fill: [1,0,0,1] }

describe("clipboard", () => {
  it("初期状態でpasteはnull", () => {
    const cb = createClipboard()
    expect(pasteFigure(cb, 0, 0)).toBeNull()
  })

  it("copyしてpasteで図形データを返す", () => {
    const cb = createClipboard()
    copyFigure(cb, fig)
    const result = pasteFigure(cb, 40, 60)!
    expect(result.kind).toBe("rect")
    expect(result.width).toBe(60)
    expect(result.height).toBe(40)
    expect(result.fill).toEqual([1,0,0,1])
    expect(result.x).toBe(40)
    expect(result.y).toBe(60)
  })

  it("pasteのx,yはスナップされる", () => {
    const cb = createClipboard()
    copyFigure(cb, fig)
    const result = pasteFigure(cb, 35, 55)!
    expect(result.x).toBe(40)
    expect(result.y).toBe(60)
  })

  it("copyはfillの参照を共有しない(ディープコピー)", () => {
    const cb = createClipboard()
    copyFigure(cb, fig)
    fig.fill[0] = 0
    const result = pasteFigure(cb, 0, 0)!
    expect(result.fill[0]).toBe(1)
    // restore
    fig.fill[0] = 1
  })
})
