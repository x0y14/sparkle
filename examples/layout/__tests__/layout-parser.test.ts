import { describe, it, expect } from "vitest"
import { parseLayoutNode, renderLayoutNode, renderLayoutNodeWithPath, createNewNode } from "../src/utils/layout-parser"

describe("parseLayoutNode", () => {
  it("returns null for invalid JSON", () => {
    expect(parseLayoutNode("{invalid")).toBeNull()
  })

  it("returns null for valid JSON that is not a LayoutNode", () => {
    expect(parseLayoutNode('{"foo":"bar"}')).toBeNull()
    expect(parseLayoutNode("42")).toBeNull()
    expect(parseLayoutNode('"string"')).toBeNull()
  })

  it("parses a valid Item", () => {
    const result = parseLayoutNode('{"type":"item","id":"a"}')
    expect(result).toEqual({ type: "item", id: "a" })
  })

  it("returns null for missing required fields", () => {
    expect(parseLayoutNode('{"type":"item"}')).toBeNull()
    expect(parseLayoutNode('{"type":"layout","direction":"vertical"}')).toBeNull()
  })

  it("parses a valid Layout with no children", () => {
    const result = parseLayoutNode('{"type":"layout","direction":"horizontal","children":[]}')
    expect(result).toEqual({ type: "layout", direction: "horizontal", children: [] })
  })

  it("returns null for invalid direction", () => {
    expect(parseLayoutNode('{"type":"layout","direction":"diagonal","children":[]}')).toBeNull()
  })

  it("parses a nested Layout", () => {
    const json = JSON.stringify({
      type: "layout",
      direction: "vertical",
      children: [
        { type: "item", id: "a" },
        {
          type: "layout",
          direction: "horizontal",
          children: [
            { type: "item", id: "b" },
            { type: "item", id: "c" },
          ],
        },
      ],
    })
    const result = parseLayoutNode(json)
    expect(result).not.toBeNull()
    expect(result!.type).toBe("layout")
    if (result!.type === "layout") {
      expect(result!.children).toHaveLength(2)
      expect(result!.children[0]).toEqual({ type: "item", id: "a" })
      expect(result!.children[1].type).toBe("layout")
    }
  })

  it("rejects Layout with invalid children", () => {
    const json = JSON.stringify({
      type: "layout",
      direction: "vertical",
      children: [{ type: "unknown" }],
    })
    expect(parseLayoutNode(json)).toBeNull()
  })
})

describe("renderLayoutNode", () => {
  it("renders an Item with data-node-type and data-node-id attributes", () => {
    const html = renderLayoutNode({ type: "item", id: "a" })
    expect(html).toContain('data-node-type="item"')
    expect(html).toContain('data-node-id="a"')
    expect(html).toContain("a")
  })

  it("renders children with flex-1", () => {
    const html = renderLayoutNode({
      type: "layout", direction: "horizontal",
      children: [{ type: "item", id: "a" }],
    })
    expect(html).toContain("flex-1")
  })

  it("renders a horizontal Layout with flex-row", () => {
    const html = renderLayoutNode({
      type: "layout",
      direction: "horizontal",
      children: [{ type: "item", id: "x" }],
    })
    expect(html).toContain("flex-row")
    expect(html).toContain('data-node-type="layout"')
    expect(html).toContain('data-direction="horizontal"')
  })

  it("renders a vertical Layout with flex-col", () => {
    const html = renderLayoutNode({
      type: "layout",
      direction: "vertical",
      children: [{ type: "item", id: "x" }],
    })
    expect(html).toContain("flex-col")
    expect(html).toContain('data-direction="vertical"')
  })

  it("renders nested layouts recursively", () => {
    const html = renderLayoutNode({
      type: "layout",
      direction: "vertical",
      children: [
        { type: "item", id: "a" },
        {
          type: "layout",
          direction: "horizontal",
          children: [
            { type: "item", id: "b" },
            { type: "item", id: "c" },
          ],
        },
      ],
    })
    expect(html).toContain('data-node-id="a"')
    expect(html).toContain('data-node-id="b"')
    expect(html).toContain('data-node-id="c"')
    expect(html).toContain("flex-col")
    expect(html).toContain("flex-row")
  })

  it("escapes HTML in id", () => {
    const html = renderLayoutNode({ type: "item", id: '<script>alert("xss")</script>' })
    expect(html).not.toContain("<script>")
    expect(html).toContain("&lt;script&gt;")
  })
})

describe("renderLayoutNodeWithPath", () => {
  it("Itemにdata-path属性を付与", () => {
    const html = renderLayoutNodeWithPath({ type: "item", id: "a" })
    expect(html).toContain('data-path=""')
    expect(html).toContain('data-node-id="a"')
  })

  it("Itemにcursor-grabクラスを付与", () => {
    const html = renderLayoutNodeWithPath({ type: "item", id: "a" })
    expect(html).toContain("cursor-grab")
  })

  it("Layoutの子に連番パスを付与", () => {
    const html = renderLayoutNodeWithPath({
      type: "layout", direction: "vertical",
      children: [
        { type: "item", id: "a" },
        { type: "item", id: "b" },
      ],
    })
    expect(html).toContain('data-path=""')
    expect(html).toContain('data-path="0"')
    expect(html).toContain('data-path="1"')
  })

  it("ネストしたパスを正しく生成", () => {
    const html = renderLayoutNodeWithPath({
      type: "layout", direction: "vertical",
      children: [
        { type: "layout", direction: "horizontal", children: [
          { type: "item", id: "x" },
        ]},
      ],
    })
    expect(html).toContain('data-path="0"')
    expect(html).toContain('data-path="0.0"')
  })
})

describe("createNewNode", () => {
  it("item生成: type=item, idがitem-で始まる8文字UUID", () => {
    const node = createNewNode("item")
    expect(node.type).toBe("item")
    if (node.type === "item") {
      expect(node.id).toMatch(/^item-[a-f0-9]{8}$/)
    }
  })

  it("vertical layout生成", () => {
    const node = createNewNode("vertical")
    expect(node).toEqual({ type: "layout", direction: "vertical", children: [] })
  })

  it("horizontal layout生成", () => {
    const node = createNewNode("horizontal")
    expect(node).toEqual({ type: "layout", direction: "horizontal", children: [] })
  })

  it("毎回異なるidを生成", () => {
    const a = createNewNode("item")
    const b = createNewNode("item")
    if (a.type === "item" && b.type === "item") {
      expect(a.id).not.toBe(b.id)
    }
  })
})
