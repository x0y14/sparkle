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
    expect(result).toEqual({ type: "item", id: "a", width: "auto", height: "auto" })
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
        { type: "item", id: "a", width: "auto", height: "auto" },
        {
          type: "layout",
          direction: "horizontal",
          children: [
            { type: "item", id: "b", width: "auto", height: "auto" },
            { type: "item", id: "c", width: "auto", height: "auto" },
          ],
        },
      ],
    })
    const result = parseLayoutNode(json)
    expect(result).not.toBeNull()
    expect(result!.type).toBe("layout")
    if (result!.type === "layout") {
      expect(result!.children).toHaveLength(2)
      expect(result!.children[0]).toEqual({ type: "item", id: "a", width: "auto", height: "auto" })
      expect(result!.children[1].type).toBe("layout")
    }
  })

  it("parses an Item with width and height", () => {
    const result = parseLayoutNode('{"type":"item","id":"a","width":"100px","height":"50px"}')
    expect(result).toEqual({ type: "item", id: "a", width: "100px", height: "50px" })
  })

  it("parses an Item without width/height (defaults to auto)", () => {
    const result = parseLayoutNode('{"type":"item","id":"a"}')
    expect(result).toEqual({ type: "item", id: "a", width: "auto", height: "auto" })
  })

  it("rejects Layout with invalid children", () => {
    const json = JSON.stringify({
      type: "layout",
      direction: "vertical",
      children: [{ type: "unknown" }],
    })
    expect(parseLayoutNode(json)).toBeNull()
  })

  it("parses a valid Spacer", () => {
    const result = parseLayoutNode('{"type":"spacer","size":"1/2"}')
    expect(result).toEqual({ type: "spacer", size: "1/2" })
  })
})

describe("renderLayoutNode", () => {
  it("renders an Item with data-node-type and data-node-id attributes", () => {
    const html = renderLayoutNode({ type: "item", id: "a", width: "auto", height: "auto" })
    expect(html).toContain('data-node-type="item"')
    expect(html).toContain('data-node-id="a"')
    expect(html).toContain("a")
  })

  it("renders children with flex-1", () => {
    const html = renderLayoutNode({
      type: "layout", direction: "horizontal",
      children: [{ type: "item", id: "a", width: "auto", height: "auto" }],
    })
    expect(html).toContain("flex-1")
  })

  it("renders a horizontal Layout with flex-row", () => {
    const html = renderLayoutNode({
      type: "layout",
      direction: "horizontal",
      children: [{ type: "item", id: "x", width: "auto", height: "auto" }],
    })
    expect(html).toContain("flex-row")
    expect(html).toContain('data-node-type="layout"')
    expect(html).toContain('data-direction="horizontal"')
  })

  it("renders a vertical Layout with flex-col", () => {
    const html = renderLayoutNode({
      type: "layout",
      direction: "vertical",
      children: [{ type: "item", id: "x", width: "auto", height: "auto" }],
    })
    expect(html).toContain("flex-col")
    expect(html).toContain('data-direction="vertical"')
  })

  it("renders nested layouts recursively", () => {
    const html = renderLayoutNode({
      type: "layout",
      direction: "vertical",
      children: [
        { type: "item", id: "a", width: "auto", height: "auto" },
        {
          type: "layout",
          direction: "horizontal",
          children: [
            { type: "item", id: "b", width: "auto", height: "auto" },
            { type: "item", id: "c", width: "auto", height: "auto" },
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

  it("renders an Item with width and height style", () => {
    const html = renderLayoutNode({ type: "item", id: "a", width: "100px", height: "50px" })
    expect(html).toContain("width: 100px")
    expect(html).toContain("height: 50px")
    expect(html).not.toContain("flex-1")
    expect(html).toContain("flex-none")
  })

  it("renders an Item with auto width/height without explicit style", () => {
    const html = renderLayoutNode({ type: "item", id: "a", width: "auto", height: "auto" })
    expect(html).not.toContain("width:")
    expect(html).not.toContain("height:")
    expect(html).toContain("flex-1")
    expect(html).not.toContain("flex-none")
  })

  it("escapes HTML in id", () => {
    const html = renderLayoutNode({ type: "item", id: '<script>alert("xss")</script>', width: "auto", height: "auto" })
    expect(html).not.toContain("<script>")
    expect(html).toContain("&lt;script&gt;")
  })

  it("renders a Spacer with green border and flex-basis", () => {
    const html = renderLayoutNode({ type: "spacer", size: "1/2" })
    expect(html).toContain('data-node-type="spacer"')
    expect(html).toContain("border-green-300")
    expect(html).toContain("spacer 1/2")
    expect(html).toContain("flex: 0 0 50%")
  })

  it("renders a Spacer with auto size using flex: 1", () => {
    const html = renderLayoutNode({ type: "spacer", size: "auto" })
    expect(html).toContain("flex: 1 1 0%")
    expect(html).toContain("spacer auto")
  })
})

describe("renderLayoutNodeWithPath", () => {
  it("Itemにdata-path属性を付与", () => {
    const html = renderLayoutNodeWithPath({ type: "item", id: "a", width: "auto", height: "auto" })
    expect(html).toContain('data-path=""')
    expect(html).toContain('data-node-id="a"')
  })

  it("Itemにcursor-grabクラスを付与", () => {
    const html = renderLayoutNodeWithPath({ type: "item", id: "a", width: "auto", height: "auto" })
    expect(html).toContain("cursor-grab")
  })

  it("Layoutの子に連番パスを付与", () => {
    const html = renderLayoutNodeWithPath({
      type: "layout", direction: "vertical",
      children: [
        { type: "item", id: "a", width: "auto", height: "auto" },
        { type: "item", id: "b", width: "auto", height: "auto" },
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
          { type: "item", id: "x", width: "auto", height: "auto" },
        ]},
      ],
    })
    expect(html).toContain('data-path="0"')
    expect(html).toContain('data-path="0.0"')
  })

  it("renders a Spacer with data-path and flex-basis", () => {
    const html = renderLayoutNodeWithPath({ type: "spacer", size: "1/3" }, "0")
    expect(html).toContain('data-path="0"')
    expect(html).toContain("flex: 0 0 33.333%")
    expect(html).toContain("cursor-grab")
  })

  it("renders a Spacer with auto size and data-path", () => {
    const html = renderLayoutNodeWithPath({ type: "spacer", size: "auto" }, "0")
    expect(html).toContain("flex: 1 1 0%")
    expect(html).toContain('data-path="0"')
  })

  it("Itemのwidth/heightをstyleに反映", () => {
    const html = renderLayoutNodeWithPath({ type: "item", id: "a", width: "200px", height: "100px" })
    expect(html).toContain("width: 200px")
    expect(html).toContain("height: 100px")
    expect(html).toContain('data-item-width="200px"')
    expect(html).toContain('data-item-height="100px"')
    expect(html).not.toContain("flex-1")
    expect(html).toContain("flex-none")
  })
})

describe("createNewNode", () => {
  it("item生成: type=item, idがitem-で始まる8文字UUID, width/height=auto", () => {
    const node = createNewNode("item")
    expect(node.type).toBe("item")
    if (node.type === "item") {
      expect(node.id).toMatch(/^item-[a-f0-9]{8}$/)
      expect(node.width).toBe("auto")
      expect(node.height).toBe("auto")
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

  it("spacer生成: type=spacer, size=1/2", () => {
    const node = createNewNode("spacer")
    expect(node).toEqual({ type: "spacer", size: "1/2" })
  })
})
