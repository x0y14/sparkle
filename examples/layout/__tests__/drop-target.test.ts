import { describe, it, expect } from "vitest"
import { findDropTarget } from "../src/utils/drop-target"
import type { LayoutGeometry } from "../src/utils/drop-target"

const layouts: LayoutGeometry[] = [
  {
    path: "",
    rect: { x: 0, y: 0, width: 400, height: 300 },
    direction: "vertical",
    childRects: [
      { path: "0", rect: { x: 0, y: 0, width: 400, height: 40 } },
      { path: "1", rect: { x: 0, y: 48, width: 400, height: 200 } },
      { path: "2", rect: { x: 0, y: 256, width: 400, height: 40 } },
    ],
  },
  {
    path: "1",
    rect: { x: 0, y: 48, width: 400, height: 200 },
    direction: "horizontal",
    childRects: [
      { path: "1.0", rect: { x: 0, y: 48, width: 196, height: 200 } },
      { path: "1.1", rect: { x: 204, y: 48, width: 196, height: 200 } },
    ],
  },
]

describe("findDropTarget", () => {
  it("vertical layout: 最初の子の上→index 0", () => {
    const result = findDropTarget(layouts, 200, 10, "2")
    expect(result).toEqual({ targetPath: "", insertIndex: 0 })
  })

  it("vertical layout: 最初と2番目の子の間→index 1", () => {
    const result = findDropTarget(layouts, 200, 44, "2")
    expect(result).toEqual({ targetPath: "", insertIndex: 1 })
  })

  it("vertical layout: 最後の子の下→最後のindex", () => {
    const result = findDropTarget(layouts, 200, 290, "0")
    expect(result).toEqual({ targetPath: "", insertIndex: 3 })
  })

  it("ネストしたlayoutを優先", () => {
    const result = findDropTarget(layouts, 100, 100, "2")
    expect(result!.targetPath).toBe("1")
  })

  it("horizontal layout: 左側→index 0", () => {
    const result = findDropTarget(layouts, 50, 100, "2")
    expect(result).toEqual({ targetPath: "1", insertIndex: 0 })
  })

  it("horizontal layout: 右側→index 2", () => {
    const result = findDropTarget(layouts, 350, 100, "2")
    expect(result).toEqual({ targetPath: "1", insertIndex: 2 })
  })

  it("sourcePathと同じlayoutはスキップ", () => {
    const result = findDropTarget(layouts, 100, 100, "1")
    expect(result!.targetPath).toBe("")
  })

  it("マウスが全layout外→null", () => {
    const result = findDropTarget(layouts, 500, 500, "0")
    expect(result).toBeNull()
  })

  it("sourcePath nullのときルートlayoutもスキップされない", () => {
    // sourcePath=""だとルートがスキップされるが、nullならされない
    // mouseが"1"(nested layout)の外、rootの中にある座標を使用
    const result = findDropTarget(layouts, 200, 270, null)
    expect(result).not.toBeNull()
    expect(result!.targetPath).toBe("")
  })
})
