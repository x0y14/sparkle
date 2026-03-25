import { describe, it, expect } from "vitest"
import { parsePath, getNode, removeNode, insertNode, moveNode, isAncestorPath, updateItemId, updateLayoutDirection, updateNodeSizing, updateItemComponent } from "../src/utils/tree-ops"
import type { LayoutNode } from "../src/utils/layout-parser"

const tree: LayoutNode = {
  type: "layout", direction: "vertical", sizing: "auto", children: [
    { type: "item", id: "a", sizing: "auto" },
    { type: "layout", direction: "horizontal", sizing: "auto", children: [
      { type: "item", id: "b", sizing: "auto" },
      { type: "item", id: "c", sizing: "auto" },
    ]},
    { type: "item", id: "d", sizing: "auto" },
  ]
}

describe("parsePath", () => {
  it("空文字列は空配列", () => { expect(parsePath("")).toEqual([]) })
  it("単一インデックス", () => { expect(parsePath("0")).toEqual([0]) })
  it("ネストパス", () => { expect(parsePath("1.0")).toEqual([1, 0]) })
})

describe("getNode", () => {
  it("ルートを取得", () => { expect(getNode(tree, "")).toBe(tree) })
  it("直接の子を取得", () => { expect(getNode(tree, "0")).toEqual({ type: "item", id: "a", sizing: "auto" }) })
  it("ネストした子を取得", () => { expect(getNode(tree, "1.1")).toEqual({ type: "item", id: "c", sizing: "auto" }) })
  it("存在しないパスはnull", () => { expect(getNode(tree, "5")).toBeNull() })
  it("Itemの子パスはnull", () => { expect(getNode(tree, "0.0")).toBeNull() })
})

describe("removeNode", () => {
  it("ルートは削除不可", () => { expect(removeNode(tree, "")).toBeNull() })
  it("直接の子を削除", () => {
    const result = removeNode(tree, "0")!
    expect(result.removed).toEqual({ type: "item", id: "a", sizing: "auto" })
    if (result.tree.type === "layout") expect(result.tree.children).toHaveLength(2)
  })
  it("ネストした子を削除", () => {
    const result = removeNode(tree, "1.0")!
    expect(result.removed).toEqual({ type: "item", id: "b", sizing: "auto" })
  })
  it("存在しないパスはnull", () => { expect(removeNode(tree, "99")).toBeNull() })
  it("元のツリーは変更されない", () => {
    const original = JSON.stringify(tree)
    removeNode(tree, "0")
    expect(JSON.stringify(tree)).toBe(original)
  })
})

describe("insertNode", () => {
  const newItem: LayoutNode = { type: "item", id: "x", sizing: "auto" }
  it("ルートの先頭に挿入", () => {
    const result = insertNode(tree, "", 0, newItem)!
    if (result.type === "layout") {
      expect(result.children).toHaveLength(4)
      expect(result.children[0]).toEqual(newItem)
    }
  })
  it("Itemへの挿入はnull", () => { expect(insertNode(tree, "0", 0, newItem)).toBeNull() })
  it("元のツリーは変更されない", () => {
    const original = JSON.stringify(tree)
    insertNode(tree, "", 0, newItem)
    expect(JSON.stringify(tree)).toBe(original)
  })
})

describe("isAncestorPath", () => {
  it("直接の親は祖先", () => { expect(isAncestorPath("1", "1.0")).toBe(true) })
  it("自分自身は祖先でない", () => { expect(isAncestorPath("1", "1")).toBe(false) })
  it("ルートは全ての祖先", () => { expect(isAncestorPath("", "0")).toBe(true) })
})

describe("moveNode", () => {
  it("itemを別のlayoutに移動", () => {
    const result = moveNode(tree, "0", "1", 0)!
    if (result.type === "layout") {
      expect(result.children).toHaveLength(2)
      const inner = result.children[0]
      if (inner.type === "layout") {
        expect(inner.children).toHaveLength(3)
        expect(inner.children[0]).toEqual({ type: "item", id: "a", sizing: "auto" })
      }
    }
  })
  it("同じ位置への移動はnull", () => { expect(moveNode(tree, "0", "", 0)).toBeNull() })
  it("自分の中にドロップ不可", () => { expect(moveNode(tree, "1", "1.0", 0)).toBeNull() })
})

describe("updateItemId", () => {
  it("itemのidを変更", () => {
    const result = updateItemId(tree, "0", "new-id")!
    const node = getNode(result, "0")
    expect(node).toEqual({ type: "item", id: "new-id", sizing: "auto" })
  })
  it("layoutパスにはnull", () => { expect(updateItemId(tree, "1", "x")).toBeNull() })
})

describe("updateLayoutDirection", () => {
  it("layoutのdirectionを変更", () => {
    const result = updateLayoutDirection(tree, "1", "vertical")!
    const node = getNode(result, "1")
    if (node?.type === "layout") expect(node.direction).toBe("vertical")
  })
  it("itemパスにはnull", () => { expect(updateLayoutDirection(tree, "0", "horizontal")).toBeNull() })
})

describe("updateNodeSizing", () => {
  it("ノードのsizingをremに変更", () => {
    const result = updateNodeSizing(tree, "0", { sizing: "rem", remW: 10, remH: 5 })!
    const node = getNode(result, "0")!
    expect(node.sizing).toBe("rem")
    if (node.sizing === "rem") {
      expect(node.remW).toBe(10)
      expect(node.remH).toBe(5)
    }
  })

  it("ノードのsizingをratioに変更", () => {
    const result = updateNodeSizing(tree, "0", { sizing: "ratio", ratioW: "1/3", ratioH: "1/2" })!
    const node = getNode(result, "0")!
    expect(node.sizing).toBe("ratio")
    if (node.sizing === "ratio") {
      expect(node.ratioW).toBe("1/3")
      expect(node.ratioH).toBe("1/2")
    }
  })

  it("ノードのsizingをautoに変更", () => {
    const result = updateNodeSizing(tree, "0", { sizing: "auto" })!
    const node = getNode(result, "0")!
    expect(node.sizing).toBe("auto")
    expect((node as any).ratioW).toBeUndefined()
    expect((node as any).remW).toBeUndefined()
  })

  it("存在しないパスはnull", () => { expect(updateNodeSizing(tree, "99", { sizing: "auto" })).toBeNull() })

  it("元のツリーは変更されない", () => {
    const original = JSON.stringify(tree)
    updateNodeSizing(tree, "0", { sizing: "rem", remW: 10, remH: 5 })
    expect(JSON.stringify(tree)).toBe(original)
  })
})

describe("updateItemComponent", () => {
  it("itemにcomponentを設定", () => {
    const result = updateItemComponent(tree, "0", "ui-button")!
    const node = getNode(result, "0")!
    if (node.type === "item") expect(node.component).toBe("ui-button")
  })

  it("componentをundefinedで解除", () => {
    const withComponent = updateItemComponent(tree, "0", "ui-button")!
    const result = updateItemComponent(withComponent, "0", undefined)!
    const node = getNode(result, "0")!
    if (node.type === "item") expect(node.component).toBeUndefined()
  })

  it("layoutパスにはnull", () => {
    expect(updateItemComponent(tree, "1", "ui-button")).toBeNull()
  })
})
