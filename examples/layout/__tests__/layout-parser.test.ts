import { describe, it, expect } from "vitest"
import { parseLayoutDocument, renderResolvedNode, renderResolvedNodeWithPath, renderComponentView } from "../src/utils/layout-parser"
import type { ResolvedNode } from "../src/utils/compute-layout"

describe("parseLayoutDocument", () => {
  it("returns null for invalid JSON", () => {
    expect(parseLayoutDocument("{invalid")).toBeNull()
  })

  it("returns null for missing settings or node", () => {
    expect(parseLayoutDocument('{"settings":{}}')).toBeNull()
    expect(parseLayoutDocument('{"node":{"type":"item","id":"a"}}')).toBeNull()
  })

  it("parses Item (sizingなし→auto補完)", () => {
    const doc = parseLayoutDocument(JSON.stringify({
      settings: { gap: 8, padding: 8 },
      node: { type: "item", id: "a" },
    }))!
    expect(doc.node).toEqual({ type: "item", id: "a", sizing: "auto" })
  })

  it("parses Item with sizing=ratio", () => {
    const doc = parseLayoutDocument(JSON.stringify({
      settings: { gap: 8, padding: 8 },
      node: { type: "item", id: "a", sizing: "ratio", ratioW: "1/3", ratioH: "1/2" },
    }))!
    expect(doc.node).toEqual({ type: "item", id: "a", sizing: "ratio", ratioW: "1/3", ratioH: "1/2" })
  })

  it("parses Item with sizing=rem", () => {
    const doc = parseLayoutDocument(JSON.stringify({
      settings: { gap: 8, padding: 8 },
      node: { type: "item", id: "a", sizing: "rem", remW: 15, remH: 10 },
    }))!
    expect(doc.node).toEqual({ type: "item", id: "a", sizing: "rem", remW: 15, remH: 10 })
  })

  it("parses Spacer with legacy size (migrates to ratioW)", () => {
    const doc = parseLayoutDocument(JSON.stringify({
      settings: { gap: 8, padding: 8 },
      node: { type: "spacer", size: "1/2" },
    }))!
    expect(doc.node).toEqual({ type: "spacer", sizing: "ratio", ratioW: "1/2", ratioH: "1/1" })
  })

  it("parses Spacer with legacy size=auto", () => {
    const doc = parseLayoutDocument(JSON.stringify({
      settings: { gap: 8, padding: 8 },
      node: { type: "spacer", size: "auto" },
    }))!
    expect(doc.node).toEqual({ type: "spacer", sizing: "auto" })
  })

  it("parses Spacer with sizing=ratio", () => {
    const doc = parseLayoutDocument(JSON.stringify({
      settings: { gap: 8, padding: 8 },
      node: { type: "spacer", sizing: "ratio", ratioW: "1/3", ratioH: "1/1" },
    }))!
    expect(doc.node).toEqual({ type: "spacer", sizing: "ratio", ratioW: "1/3", ratioH: "1/1" })
  })

  it("parses Spacer with sizing=rem", () => {
    const doc = parseLayoutDocument(JSON.stringify({
      settings: { gap: 8, padding: 8 },
      node: { type: "spacer", sizing: "rem", remW: 5, remH: 3 },
    }))!
    expect(doc.node).toEqual({ type: "spacer", sizing: "rem", remW: 5, remH: 3 })
  })

  it("rejects spacer without size or sizing", () => {
    expect(parseLayoutDocument(JSON.stringify({
      settings: { gap: 8, padding: 8 },
      node: { type: "spacer" },
    }))).toBeNull()
  })

  it("rejects ratio without ratioW/ratioH", () => {
    expect(parseLayoutDocument(JSON.stringify({
      settings: { gap: 8, padding: 8 },
      node: { type: "item", id: "a", sizing: "ratio" },
    }))).toBeNull()
  })

  it("rejects ratio with only ratioW", () => {
    expect(parseLayoutDocument(JSON.stringify({
      settings: { gap: 8, padding: 8 },
      node: { type: "item", id: "a", sizing: "ratio", ratioW: "1/3" },
    }))).toBeNull()
  })

  it("rejects rem without remW/remH", () => {
    expect(parseLayoutDocument(JSON.stringify({
      settings: { gap: 8, padding: 8 },
      node: { type: "item", id: "a", sizing: "rem" },
    }))).toBeNull()
  })

  it("rejects rem with only remW", () => {
    expect(parseLayoutDocument(JSON.stringify({
      settings: { gap: 8, padding: 8 },
      node: { type: "item", id: "a", sizing: "rem", remW: 10 },
    }))).toBeNull()
  })

  it("parses Layout (sizingなし→auto補完, 子も補完)", () => {
    const doc = parseLayoutDocument(JSON.stringify({
      settings: { gap: 8, padding: 8 },
      node: {
        type: "layout", direction: "vertical",
        children: [{ type: "item", id: "a" }],
      },
    }))!
    if (doc.node.type === "layout") {
      expect(doc.node.sizing).toBe("auto")
      expect(doc.node.children[0]).toEqual({ type: "item", id: "a", sizing: "auto" })
    }
  })

  it("parses Layout with sizing=ratio", () => {
    const doc = parseLayoutDocument(JSON.stringify({
      settings: { gap: 8, padding: 8 },
      node: { type: "layout", direction: "horizontal", sizing: "ratio", ratioW: "1/3", ratioH: "1/1", children: [] },
    }))!
    if (doc.node.type === "layout" && doc.node.sizing === "ratio") {
      expect(doc.node.ratioW).toBe("1/3")
    }
  })

  it("parses Layout children (migrates spacer)", () => {
    const doc = parseLayoutDocument(JSON.stringify({
      settings: { gap: 8, padding: 8 },
      node: {
        type: "layout", direction: "vertical",
        children: [
          { type: "item", id: "a" },
          { type: "spacer", size: "1/2" },
        ],
      },
    }))!
    if (doc.node.type === "layout") {
      expect(doc.node.children).toHaveLength(2)
      expect(doc.node.children[0]).toEqual({ type: "item", id: "a", sizing: "auto" })
      expect(doc.node.children[1]).toEqual({ type: "spacer", sizing: "ratio", ratioW: "1/2", ratioH: "1/1" })
    }
  })

  it("rejects invalid node types", () => {
    expect(parseLayoutDocument(JSON.stringify({
      settings: { gap: 8, padding: 8 },
      node: { type: "unknown" },
    }))).toBeNull()
  })

  it("defaults settings", () => {
    const doc = parseLayoutDocument(JSON.stringify({
      settings: {},
      node: { type: "item", id: "a" },
    }))!
    expect(doc.settings.gap).toBe(8)
    expect(doc.settings.padding).toBe(8)
    expect(doc.settings.alignItems).toBeUndefined()
    expect(doc.settings.justifyContent).toBeUndefined()
  })

  it("parses settings with alignItems/justifyContent", () => {
    const doc = parseLayoutDocument(JSON.stringify({
      settings: { gap: 8, padding: 8, alignItems: "center", justifyContent: "space-between" },
      node: { type: "item", id: "a" },
    }))!
    expect(doc.settings.alignItems).toBe("center")
    expect(doc.settings.justifyContent).toBe("space-between")
  })

  it("ignores invalid alignItems/justifyContent", () => {
    const doc = parseLayoutDocument(JSON.stringify({
      settings: { gap: 8, padding: 8, alignItems: "invalid", justifyContent: "invalid" },
      node: { type: "item", id: "a" },
    }))!
    expect(doc.settings.alignItems).toBeUndefined()
    expect(doc.settings.justifyContent).toBeUndefined()
  })

  it("rejects item without id", () => {
    expect(parseLayoutDocument(JSON.stringify({
      settings: { gap: 8, padding: 8 },
      node: { type: "item" },
    }))).toBeNull()
  })

  it("rejects layout without children", () => {
    expect(parseLayoutDocument(JSON.stringify({
      settings: { gap: 8, padding: 8 },
      node: { type: "layout", direction: "vertical" },
    }))).toBeNull()
  })

  it("parses Item with component", () => {
    const doc = parseLayoutDocument(JSON.stringify({
      settings: { gap: 8, padding: 8 },
      node: { type: "item", id: "a", sizing: "auto", component: "ui-button" },
    }))!
    if (doc.node.type === "item") {
      expect(doc.node.component).toBe("ui-button")
    }
  })

  it("parses Item without component", () => {
    const doc = parseLayoutDocument(JSON.stringify({
      settings: { gap: 8, padding: 8 },
      node: { type: "item", id: "a", sizing: "auto" },
    }))!
    if (doc.node.type === "item") {
      expect(doc.node.component).toBeUndefined()
    }
  })
})

describe("renderResolvedNode", () => {
  it("Itemを絶対配置で描画", () => {
    const resolved: ResolvedNode = { node: { type: "item", id: "a", sizing: "auto" }, x: 100, y: 160, w: 500, h: 240 }
    const html = renderResolvedNode(resolved, false)
    expect(html).toContain("position: absolute")
    expect(html).toContain("left: 100px")
    expect(html).toContain("width: 500px")
    expect(html).toContain('data-node-id="a"')
  })

  it("ルートLayoutをposition:relativeで描画", () => {
    const resolved: ResolvedNode = {
      node: { type: "layout", direction: "vertical", sizing: "auto", children: [] },
      x: 0, y: 0, w: 1000, h: 800,
      children: [{ node: { type: "item", id: "a", sizing: "auto" }, x: 8, y: 8, w: 984, h: 784 }],
    }
    const html = renderResolvedNode(resolved)
    expect(html).toContain("position: relative")
    expect(html).toContain("position: absolute")
  })

  it("Spacerを描画（ratioを表示）", () => {
    const resolved: ResolvedNode = { node: { type: "spacer", sizing: "ratio", ratioW: "1/2", ratioH: "1/1" }, x: 8, y: 8, w: 388, h: 584 }
    const html = renderResolvedNode(resolved, false)
    expect(html).toContain("spacer ratio:1/2")
  })

  it("Spacerを描画（autoを表示）", () => {
    const resolved: ResolvedNode = { node: { type: "spacer", sizing: "auto" }, x: 8, y: 8, w: 388, h: 584 }
    const html = renderResolvedNode(resolved, false)
    expect(html).toContain("spacer auto")
  })

  it("escapes HTML in id", () => {
    const resolved: ResolvedNode = { node: { type: "item", id: '<script>', sizing: "auto" }, x: 0, y: 0, w: 100, h: 100 }
    const html = renderResolvedNode(resolved)
    expect(html).not.toContain("<script>")
    expect(html).toContain("&lt;script&gt;")
  })
})

describe("renderResolvedNodeWithPath", () => {
  it("data-path属性を付与", () => {
    const resolved: ResolvedNode = { node: { type: "item", id: "a", sizing: "auto" }, x: 0, y: 0, w: 100, h: 100 }
    const html = renderResolvedNodeWithPath(resolved, "", true)
    expect(html).toContain('data-path=""')
    expect(html).toContain("cursor-grab")
  })

  it("Layoutの子に連番パスを付与", () => {
    const resolved: ResolvedNode = {
      node: { type: "layout", direction: "vertical", sizing: "auto", children: [] },
      x: 0, y: 0, w: 800, h: 600,
      children: [
        { node: { type: "item", id: "a", sizing: "auto" }, x: 8, y: 8, w: 784, h: 288 },
        { node: { type: "item", id: "b", sizing: "auto" }, x: 8, y: 304, w: 784, h: 288 },
      ],
    }
    const html = renderResolvedNodeWithPath(resolved, "", true)
    expect(html).toContain('data-path=""')
    expect(html).toContain('data-path="0"')
    expect(html).toContain('data-path="1"')
  })
})

describe("renderComponentView", () => {
  it("component割り当てありのItemはコンポーネントタグで描画", () => {
    const resolved: ResolvedNode = {
      node: { type: "item", id: "a", sizing: "auto", component: "ui-button" },
      x: 10, y: 20, w: 200, h: 40,
    }
    const html = renderComponentView(resolved)
    expect(html).toContain("<ui-button")
    expect(html).toContain("position: absolute")
    expect(html).toContain("left: 10px")
    expect(html).toContain("width: 200px")
    expect(html).toContain("height: 40px")
  })

  it("component割り当てなしのItemは空divで描画", () => {
    const resolved: ResolvedNode = {
      node: { type: "item", id: "a", sizing: "auto" },
      x: 10, y: 20, w: 200, h: 40,
    }
    const html = renderComponentView(resolved)
    expect(html).not.toContain("<ui-")
    expect(html).toContain("position: absolute")
  })

  it("Spacerは空文字列", () => {
    const resolved: ResolvedNode = {
      node: { type: "spacer", sizing: "auto" },
      x: 0, y: 0, w: 100, h: 100,
    }
    expect(renderComponentView(resolved)).toBe("")
  })

  it("Layoutは子のみ描画（枠線なし）", () => {
    const resolved: ResolvedNode = {
      node: { type: "layout", direction: "vertical", sizing: "auto", children: [] },
      x: 0, y: 0, w: 800, h: 600,
      children: [
        { node: { type: "item", id: "a", sizing: "auto", component: "ui-button" }, x: 8, y: 8, w: 200, h: 40 },
      ],
    }
    const html = renderComponentView(resolved)
    expect(html).toContain("<ui-button")
    expect(html).not.toContain("border-")
    expect(html).not.toContain("data-node-type")
  })

  it("ルートLayoutはposition:relativeのラッパーで描画", () => {
    const resolved: ResolvedNode = {
      node: { type: "layout", direction: "vertical", sizing: "auto", children: [] },
      x: 0, y: 0, w: 800, h: 600,
      children: [],
    }
    const html = renderComponentView(resolved, true)
    expect(html).toContain("position: relative")
    expect(html).toContain("width: 800px")
    expect(html).toContain("height: 600px")
  })
})
