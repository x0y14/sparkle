import { isAncestorPath } from "./tree-ops"

export interface LayoutGeometry {
  path: string
  rect: { x: number; y: number; width: number; height: number }
  direction: "vertical" | "horizontal"
  childRects: { path: string; rect: { x: number; y: number; width: number; height: number } }[]
}

export interface DropResult {
  targetPath: string
  insertIndex: number
}

function containsPoint(rect: { x: number; y: number; width: number; height: number }, mx: number, my: number): boolean {
  return mx >= rect.x && mx <= rect.x + rect.width && my >= rect.y && my <= rect.y + rect.height
}

export function findDropTarget(
  layouts: LayoutGeometry[],
  mouseX: number,
  mouseY: number,
  sourcePath: string | null,
): DropResult | null {
  const sorted = [...layouts].sort((a, b) => b.path.length - a.path.length)

  for (const layout of sorted) {
    if (!containsPoint(layout.rect, mouseX, mouseY)) continue
    if (sourcePath !== null && (layout.path === sourcePath || isAncestorPath(sourcePath, layout.path))) continue

    let insertIndex = layout.childRects.length
    for (let i = 0; i < layout.childRects.length; i++) {
      const child = layout.childRects[i]
      const mid = layout.direction === "vertical"
        ? child.rect.y + child.rect.height / 2
        : child.rect.x + child.rect.width / 2
      const mousePos = layout.direction === "vertical" ? mouseY : mouseX
      if (mousePos < mid) {
        insertIndex = i
        break
      }
    }
    return { targetPath: layout.path, insertIndex }
  }
  return null
}

export function extractLayoutGeometry(root: Element | ShadowRoot): LayoutGeometry[] {
  const layouts: LayoutGeometry[] = []
  const elements = root.querySelectorAll("[data-node-type='layout']")
  for (const el of elements) {
    const path = el.getAttribute("data-path") ?? ""
    const direction = el.getAttribute("data-direction") as "vertical" | "horizontal"
    const rect = el.getBoundingClientRect()
    const childRects: LayoutGeometry["childRects"] = []
    for (const child of el.children) {
      const childPath = child.getAttribute("data-path")
      if (childPath) {
        const childRect = child.getBoundingClientRect()
        childRects.push({ path: childPath, rect: { x: childRect.x, y: childRect.y, width: childRect.width, height: childRect.height } })
      }
    }
    layouts.push({ path, rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height }, direction, childRects })
  }
  return layouts
}
