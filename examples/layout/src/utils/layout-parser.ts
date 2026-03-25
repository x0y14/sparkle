export type AutoSizing = { sizing: "auto" }
export type RatioSizing = { sizing: "ratio"; ratioW: string; ratioH: string }
export type RemSizing = { sizing: "rem"; remW: number; remH: number }
export type NodeSizing = AutoSizing | RatioSizing | RemSizing
export type SizingMode = NodeSizing["sizing"]

export type Item = { type: "item"; id: string; component?: string } & NodeSizing

export const AVAILABLE_COMPONENTS = [
  { tag: "ui-button", label: "Button" },
  { tag: "ui-input", label: "Input" },
  { tag: "ui-card", label: "Card" },
  { tag: "ui-badge", label: "Badge" },
  { tag: "ui-switch", label: "Switch" },
  { tag: "ui-checkbox", label: "Checkbox" },
  { tag: "ui-chip", label: "Chip" },
  { tag: "ui-avatar", label: "Avatar" },
  { tag: "ui-progress-bar", label: "Progress Bar" },
  { tag: "ui-textarea", label: "Textarea" },
] as const
export type Layout = { type: "layout"; direction: "vertical" | "horizontal"; children: LayoutNode[] } & NodeSizing
export type Spacer = { type: "spacer" } & NodeSizing
export type LayoutNode = Item | Layout | Spacer

export type LayoutSettings = {
  gap: number
  padding: number
  alignItems?: "start" | "center" | "end" | "stretch"
  justifyContent?: "start" | "center" | "end" | "space-between" | "space-around" | "space-evenly"
}

export type LayoutDocument = {
  settings: LayoutSettings
  node: LayoutNode
}

function isItem(obj: unknown): obj is Item {
  if (typeof obj !== "object" || obj === null) return false
  const o = obj as Record<string, unknown>
  return o.type === "item" && typeof o.id === "string"
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
  if (typeof obj !== "object" || obj === null) return false
  const o = obj as Record<string, unknown>
  if (o.type !== "spacer") return false
  return typeof o.size === "string" || o.sizing !== undefined
}

function isLayoutNode(obj: unknown): obj is LayoutNode {
  return isItem(obj) || isLayout(obj) || isSpacer(obj)
}

function migrateNode(node: LayoutNode): LayoutNode | null {
  if (node.type === "spacer") {
    const o = node as any
    if (o.size && !o.sizing) {
      const { size, ...rest } = o
      if (size === "auto") return { ...rest, type: "spacer" as const, sizing: "auto" as const }
      return { ...rest, type: "spacer" as const, sizing: "ratio" as const, ratioW: size, ratioH: "1/1" }
    }
  }

  const o = node as any
  const sizing = o.sizing ?? "auto"

  if (sizing === "ratio") {
    if (typeof o.ratioW !== "string" || typeof o.ratioH !== "string") return null
  } else if (sizing === "rem") {
    if (typeof o.remW !== "number" || typeof o.remH !== "number") return null
  }

  if (node.type === "layout") {
    const children: LayoutNode[] = []
    for (const child of node.children) {
      const migrated = migrateNode(child)
      if (!migrated) return null
      children.push(migrated)
    }
    return { ...node, sizing, children }
  }
  return { ...node, sizing }
}

const VALID_ALIGN_ITEMS = ["start", "center", "end", "stretch"]
const VALID_JUSTIFY_CONTENT = ["start", "center", "end", "space-between", "space-around", "space-evenly"]

export function parseLayoutDocument(json: string): LayoutDocument | null {
  try {
    const parsed = JSON.parse(json)
    if (!parsed || typeof parsed !== "object") return null
    if (!parsed.settings || typeof parsed.settings !== "object") return null
    if (!isLayoutNode(parsed.node)) return null
    const migrated = migrateNode(parsed.node)
    if (!migrated) return null
    return {
      settings: {
        gap: typeof parsed.settings.gap === "number" ? parsed.settings.gap : 8,
        padding: typeof parsed.settings.padding === "number" ? parsed.settings.padding : 8,
        ...(VALID_ALIGN_ITEMS.includes(parsed.settings.alignItems) ? { alignItems: parsed.settings.alignItems } : {}),
        ...(VALID_JUSTIFY_CONTENT.includes(parsed.settings.justifyContent) ? { justifyContent: parsed.settings.justifyContent } : {}),
      },
      node: migrated,
    }
  } catch {
    return null
  }
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

import type { ResolvedNode } from "./compute-layout"

function spacerLabel(node: Spacer): string {
  if (node.sizing === "ratio") return `spacer ratio:${escapeHtml(node.ratioW)}`
  if (node.sizing === "rem") return `spacer rem`
  return `spacer auto`
}

export function renderResolvedNode(resolved: ResolvedNode, isRoot: boolean = true): string {
  const { node, x, y, w, h } = resolved
  const position = isRoot ? "relative" : "absolute"

  if (node.type === "item") {
    const id = escapeHtml(node.id)
    return `<div data-node-type="item" data-node-id="${id}" style="position: ${position}; left: ${x}px; top: ${y}px; width: ${w}px; height: ${h}px;" class="flex items-center justify-center border-2 border-blue-300 bg-blue-50 rounded text-sm font-mono">${id}</div>`
  }
  if (node.type === "spacer") {
    const label = spacerLabel(node)
    return `<div data-node-type="spacer" style="position: ${position}; left: ${x}px; top: ${y}px; width: ${w}px; height: ${h}px;" class="flex items-center justify-center border-2 border-green-300 bg-green-50 rounded text-sm font-mono">${label}</div>`
  }
  const childrenHtml = (resolved.children ?? []).map(c => renderResolvedNode(c, false)).join("")
  return `<div data-node-type="layout" data-direction="${node.direction}" style="position: ${position}; left: ${x}px; top: ${y}px; width: ${w}px; height: ${h}px;" class="border-2 border-gray-300 bg-gray-50 rounded">${childrenHtml}</div>`
}

export function renderResolvedNodeWithPath(resolved: ResolvedNode, path: string = "", isRoot: boolean = true): string {
  const { node, x, y, w, h } = resolved
  const position = isRoot ? "relative" : "absolute"

  if (node.type === "item") {
    const id = escapeHtml(node.id)
    return `<div data-node-type="item" data-node-id="${id}" data-path="${path}" style="position: ${position}; left: ${x}px; top: ${y}px; width: ${w}px; height: ${h}px;" class="flex items-center justify-center border-2 border-blue-300 bg-blue-50 rounded text-sm font-mono cursor-grab">${id}</div>`
  }
  if (node.type === "spacer") {
    const label = spacerLabel(node)
    return `<div data-node-type="spacer" data-path="${path}" style="position: ${position}; left: ${x}px; top: ${y}px; width: ${w}px; height: ${h}px;" class="flex items-center justify-center border-2 border-green-300 bg-green-50 rounded text-sm font-mono cursor-grab">${label}</div>`
  }
  const childrenHtml = (resolved.children ?? []).map((c, i) => {
    const childPath = path === "" ? `${i}` : `${path}.${i}`
    return renderResolvedNodeWithPath(c, childPath, false)
  }).join("")
  return `<div data-node-type="layout" data-direction="${node.direction}" data-path="${path}" style="position: ${position}; left: ${x}px; top: ${y}px; width: ${w}px; height: ${h}px;" class="border-2 border-gray-300 bg-gray-50 rounded">${childrenHtml}</div>`
}

export function renderComponentView(resolved: ResolvedNode, isRoot: boolean = true): string {
  const { node, x, y, w, h } = resolved

  if (node.type === "spacer") return ""

  if (node.type === "item") {
    const style = `position: absolute; left: ${x}px; top: ${y}px; width: ${w}px; height: ${h}px;`
    if (node.component) {
      const tag = escapeHtml(node.component)
      return `<${tag} style="${style}"></${tag}>`
    }
    return `<div style="${style}"></div>`
  }

  const childrenHtml = (resolved.children ?? []).map(c => renderComponentView(c, false)).join("")
  if (isRoot) {
    return `<div style="position: relative; width: ${w}px; height: ${h}px;">${childrenHtml}</div>`
  }
  return childrenHtml
}

export function createNewNode(nodeType: "item" | "vertical" | "horizontal" | "spacer"): LayoutNode {
  if (nodeType === "item") {
    return { type: "item", id: `item-${crypto.randomUUID().slice(0, 8)}`, sizing: "auto" }
  }
  if (nodeType === "spacer") {
    return { type: "spacer", sizing: "auto" }
  }
  return { type: "layout", direction: nodeType, children: [], sizing: "auto" }
}
