export type Item = { type: "item"; id: string }
export type Layout = { type: "layout"; direction: "vertical" | "horizontal"; children: LayoutNode[] }
export type Spacer = { type: "spacer"; size: string }
export type LayoutNode = Item | Layout | Spacer

function isItem(obj: unknown): obj is Item {
  return (
    typeof obj === "object" &&
    obj !== null &&
    (obj as Record<string, unknown>).type === "item" &&
    typeof (obj as Record<string, unknown>).id === "string"
  )
}

function isLayout(obj: unknown): obj is Layout {
  if (typeof obj !== "object" || obj === null) return false
  const o = obj as Record<string, unknown>
  return (
    o.type === "layout" &&
    (o.direction === "vertical" || o.direction === "horizontal") &&
    Array.isArray(o.children) &&
    (o.children as unknown[]).every((c) => isLayoutNode(c))
  )
}

function isSpacer(obj: unknown): obj is Spacer {
  return (
    typeof obj === "object" &&
    obj !== null &&
    (obj as Record<string, unknown>).type === "spacer" &&
    typeof (obj as Record<string, unknown>).size === "string"
  )
}

function isLayoutNode(obj: unknown): obj is LayoutNode {
  return isItem(obj) || isLayout(obj) || isSpacer(obj)
}

export function parseLayoutNode(json: string): LayoutNode | null {
  try {
    const parsed: unknown = JSON.parse(json)
    if (isLayoutNode(parsed)) return parsed
    return null
  } catch {
    return null
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function sizeToBasis(size: string): string {
  if (size === "1/2") return "50%"
  if (size === "1/3") return "33.333%"
  if (size === "2/3") return "66.667%"
  if (size === "1/4") return "25%"
  if (size === "3/4") return "75%"
  return size
}

export function renderLayoutNode(node: LayoutNode): string {
  if (node.type === "item") {
    const id = escapeHtml(node.id)
    return `<div data-node-type="item" data-node-id="${id}" class="flex flex-1 items-center justify-center p-4 border-2 border-blue-300 bg-blue-50 rounded text-sm font-mono">${id}</div>`
  }
  if (node.type === "spacer") {
    const flexStyle = node.size === "auto" ? "flex: 1 1 0%" : `flex: 0 0 ${sizeToBasis(node.size)}`
    return `<div data-node-type="spacer" data-spacer-size="${escapeHtml(node.size)}" style="${flexStyle}" class="flex items-center justify-center p-4 border-2 border-green-300 bg-green-50 rounded text-sm font-mono">spacer ${escapeHtml(node.size)}</div>`
  }
  const flexDir = node.direction === "horizontal" ? "flex-row" : "flex-col"
  const childrenHtml = node.children.map((c) => renderLayoutNode(c)).join("")
  return `<div data-node-type="layout" data-direction="${node.direction}" class="flex flex-1 ${flexDir} gap-2 p-2 border-2 border-gray-300 bg-gray-50 rounded">${childrenHtml}</div>`
}

export function renderLayoutNodeWithPath(node: LayoutNode, path: string = ""): string {
  if (node.type === "item") {
    const id = escapeHtml(node.id)
    return `<div data-node-type="item" data-node-id="${id}" data-path="${path}" class="flex flex-1 items-center justify-center p-4 border-2 border-blue-300 bg-blue-50 rounded text-sm font-mono cursor-grab">${id}</div>`
  }
  if (node.type === "spacer") {
    const flexStyle = node.size === "auto" ? "flex: 1 1 0%" : `flex: 0 0 ${sizeToBasis(node.size)}`
    return `<div data-node-type="spacer" data-spacer-size="${escapeHtml(node.size)}" data-path="${path}" style="${flexStyle}" class="flex items-center justify-center p-4 border-2 border-green-300 bg-green-50 rounded text-sm font-mono cursor-grab">spacer ${escapeHtml(node.size)}</div>`
  }
  const flexDir = node.direction === "horizontal" ? "flex-row" : "flex-col"
  const childrenHtml = node.children.map((c, i) => {
    const childPath = path === "" ? `${i}` : `${path}.${i}`
    return renderLayoutNodeWithPath(c, childPath)
  }).join("")
  return `<div data-node-type="layout" data-direction="${node.direction}" data-path="${path}" class="flex flex-1 ${flexDir} gap-2 p-2 border-2 border-gray-300 bg-gray-50 rounded">${childrenHtml}</div>`
}

export function createNewNode(nodeType: "item" | "vertical" | "horizontal" | "spacer"): LayoutNode {
  if (nodeType === "item") {
    return { type: "item", id: `item-${crypto.randomUUID().slice(0, 8)}` }
  }
  if (nodeType === "spacer") {
    return { type: "spacer", size: "1/2" }
  }
  return { type: "layout", direction: nodeType, children: [] }
}
