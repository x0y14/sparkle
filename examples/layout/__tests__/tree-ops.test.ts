import { describe, it, expect } from "vitest"
import { parsePath, getNode, removeNode, insertNode, moveNode, isAncestorPath, updateItemId, updateLayoutDirection, updateSpacerSize } from "../src/utils/tree-ops"
import type { LayoutNode } from "../src/utils/layout-parser"

const tree: LayoutNode = {
  type: "layout", direction: "vertical", children: [
    { type: "item", id: "a" },
    { type: "layout", direction: "horizontal", children: [
      { type: "item", id: "b" },
      { type: "item", id: "c" },
    ]},
    { type: "item", id: "d" },
  ]
}

describe("parsePath", () => {
  it("空文字列は空配列", () => {
    expect(parsePath("")).toEqual([])
  })
  it("単一インデックス", () => {
    expect(parsePath("0")).toEqual([0])
  })
  it("ネストパス", () => {
    expect(parsePath("1.0")).toEqual([1, 0])
  })
})

describe("getNode", () => {
  it("ルートを取得", () => {
    expect(getNode(tree, "")).toBe(tree)
  })
  it("直接の子を取得", () => {
    expect(getNode(tree, "0")).toEqual({ type: "item", id: "a" })
  })
  it("ネストした子を取得", () => {
    expect(getNode(tree, "1.1")).toEqual({ type: "item", id: "c" })
  })
  it("存在しないパスはnull", () => {
    expect(getNode(tree, "5")).toBeNull()
  })
  it("Itemの子パスはnull", () => {
    expect(getNode(tree, "0.0")).toBeNull()
  })
})

describe("removeNode", () => {
  it("ルートは削除不可", () => {
    expect(removeNode(tree, "")).toBeNull()
  })
  it("直接の子を削除", () => {
    const result = removeNode(tree, "0")!
    expect(result.removed).toEqual({ type: "item", id: "a" })
    expect(result.tree.type).toBe("layout")
    if (result.tree.type === "layout") {
      expect(result.tree.children).toHaveLength(2)
    }
  })
  it("ネストした子を削除", () => {
    const result = removeNode(tree, "1.0")!
    expect(result.removed).toEqual({ type: "item", id: "b" })
  })
  it("存在しないパスはnull", () => {
    expect(removeNode(tree, "99")).toBeNull()
  })
  it("元のツリーは変更されない", () => {
    const original = JSON.stringify(tree)
    removeNode(tree, "0")
    expect(JSON.stringify(tree)).toBe(original)
  })
})

describe("insertNode", () => {
  const newItem: LayoutNode = { type: "item", id: "x" }

  it("ルートの先頭に挿入", () => {
    const result = insertNode(tree, "", 0, newItem)!
    if (result.type === "layout") {
      expect(result.children).toHaveLength(4)
      expect(result.children[0]).toEqual(newItem)
    }
  })
  it("ルートの末尾に挿入", () => {
    const result = insertNode(tree, "", 3, newItem)!
    if (result.type === "layout") {
      expect(result.children[3]).toEqual(newItem)
    }
  })
  it("ネストLayoutに挿入", () => {
    const result = insertNode(tree, "1", 1, newItem)!
    const layout = getNode(result, "1")
    if (layout && layout.type === "layout") {
      expect(layout.children).toHaveLength(3)
      expect(layout.children[1]).toEqual(newItem)
    }
  })
  it("Itemへの挿入はnull", () => {
    expect(insertNode(tree, "0", 0, newItem)).toBeNull()
  })
  it("元のツリーは変更されない", () => {
    const original = JSON.stringify(tree)
    insertNode(tree, "", 0, newItem)
    expect(JSON.stringify(tree)).toBe(original)
  })
})

describe("isAncestorPath", () => {
  it("直接の親は祖先", () => {
    expect(isAncestorPath("1", "1.0")).toBe(true)
  })
  it("間接の祖先", () => {
    expect(isAncestorPath("1", "1.0.2")).toBe(true)
  })
  it("自分自身は祖先でない", () => {
    expect(isAncestorPath("1", "1")).toBe(false)
  })
  it("兄弟は祖先でない", () => {
    expect(isAncestorPath("1", "2")).toBe(false)
  })
  it("ルートは全ての祖先", () => {
    expect(isAncestorPath("", "0")).toBe(true)
  })
})

describe("moveNode", () => {
  it("itemを別のlayoutに移動", () => {
    const result = moveNode(tree, "0", "1", 0)!
    expect(result).not.toBeNull()
    if (result.type === "layout") {
      expect(result.children).toHaveLength(2)
      const inner = result.children[0]
      if (inner.type === "layout") {
        expect(inner.children).toHaveLength(3)
        expect(inner.children[0]).toEqual({ type: "item", id: "a" })
      }
    }
  })
  it("ネストからルートに移動", () => {
    const result = moveNode(tree, "1.1", "", 0)!
    if (result.type === "layout") {
      expect(result.children[0]).toEqual({ type: "item", id: "c" })
      expect(result.children).toHaveLength(4)
    }
  })
  it("同じ親内での並べ替え（前から後ろ）", () => {
    const result = moveNode(tree, "0", "", 2)!
    if (result.type === "layout") {
      expect(result.children).toHaveLength(3)
      expect(result.children[1]).toEqual({ type: "item", id: "a" })
    }
  })
  it("同じ位置への移動はnull", () => {
    expect(moveNode(tree, "0", "", 0)).toBeNull()
    expect(moveNode(tree, "0", "", 1)).toBeNull()
  })
  it("自分の中にドロップ不可", () => {
    expect(moveNode(tree, "1", "1.0", 0)).toBeNull()
  })
})

describe("updateItemId", () => {
  it("itemのidを変更", () => {
    const result = updateItemId(tree, "0", "new-id")!
    const node = getNode(result, "0")
    expect(node).toEqual({ type: "item", id: "new-id" })
  })
  it("layoutパスにはnull", () => {
    expect(updateItemId(tree, "1", "x")).toBeNull()
  })
  it("元のツリーは変更されない", () => {
    const original = JSON.stringify(tree)
    updateItemId(tree, "0", "new-id")
    expect(JSON.stringify(tree)).toBe(original)
  })
})

describe("updateLayoutDirection", () => {
  it("layoutのdirectionを変更", () => {
    const result = updateLayoutDirection(tree, "1", "vertical")!
    const node = getNode(result, "1")
    if (node?.type === "layout") {
      expect(node.direction).toBe("vertical")
    }
  })
  it("itemパスにはnull", () => {
    expect(updateLayoutDirection(tree, "0", "horizontal")).toBeNull()
  })
  it("元のツリーは変更されない", () => {
    const original = JSON.stringify(tree)
    updateLayoutDirection(tree, "1", "vertical")
    expect(JSON.stringify(tree)).toBe(original)
  })
})

describe("updateSpacerSize", () => {
  const spacerTree: import("../src/utils/layout-parser").LayoutNode = {
    type: "layout", direction: "vertical", children: [
      { type: "spacer", size: "1/2" },
      { type: "item", id: "a" },
    ]
  }

  it("spacerのsizeを変更", () => {
    const result = updateSpacerSize(spacerTree, "0", "1/3")!
    const node = getNode(result, "0")
    expect(node).toEqual({ type: "spacer", size: "1/3" })
  })
  it("itemパスにはnull", () => {
    expect(updateSpacerSize(spacerTree, "1", "1/2")).toBeNull()
  })
  it("元のツリーは変更されない", () => {
    const original = JSON.stringify(spacerTree)
    updateSpacerSize(spacerTree, "0", "1/3")
    expect(JSON.stringify(spacerTree)).toBe(original)
  })
})
