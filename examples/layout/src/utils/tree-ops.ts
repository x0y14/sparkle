import type { LayoutNode } from "./layout-parser"

export type NodePath = string

export function parsePath(path: NodePath): number[] {
  if (path === "") return []
  return path.split(".").map(Number)
}

export function getNode(tree: LayoutNode, path: NodePath): LayoutNode | null {
  const indices = parsePath(path)
  let current: LayoutNode = tree
  for (const i of indices) {
    if (current.type !== "layout") return null
    if (i < 0 || i >= current.children.length) return null
    current = current.children[i]
  }
  return current
}

function cloneTree(tree: LayoutNode): LayoutNode {
  return JSON.parse(JSON.stringify(tree))
}

export function removeNode(tree: LayoutNode, path: NodePath): { tree: LayoutNode; removed: LayoutNode } | null {
  if (path === "") return null
  const indices = parsePath(path)
  const cloned = cloneTree(tree)
  let parent: LayoutNode = cloned
  for (let i = 0; i < indices.length - 1; i++) {
    if (parent.type !== "layout") return null
    if (indices[i] < 0 || indices[i] >= parent.children.length) return null
    parent = parent.children[indices[i]]
  }
  if (parent.type !== "layout") return null
  const lastIndex = indices[indices.length - 1]
  if (lastIndex < 0 || lastIndex >= parent.children.length) return null
  const removed = parent.children.splice(lastIndex, 1)[0]
  return { tree: cloned, removed }
}

export function insertNode(tree: LayoutNode, targetPath: NodePath, index: number, node: LayoutNode): LayoutNode | null {
  const target = getNode(tree, targetPath)
  if (!target || target.type !== "layout") return null
  const cloned = cloneTree(tree)
  let current: LayoutNode = cloned
  const indices = parsePath(targetPath)
  for (const i of indices) {
    if (current.type !== "layout") return null
    current = current.children[i]
  }
  if (current.type !== "layout") return null
  current.children.splice(index, 0, cloneTree(node))
  return cloned
}

export function isAncestorPath(ancestor: NodePath, descendant: NodePath): boolean {
  if (ancestor === descendant) return false
  if (ancestor === "") return true
  return descendant.startsWith(ancestor + ".")
}

export function moveNode(tree: LayoutNode, sourcePath: NodePath, targetPath: NodePath, insertIndex: number): LayoutNode | null {
  if (isAncestorPath(sourcePath, targetPath)) return null

  const sourceIndices = parsePath(sourcePath)
  const sourceParentPath = sourceIndices.length <= 1 ? "" : sourceIndices.slice(0, -1).join(".")
  const sourceIndex = sourceIndices[sourceIndices.length - 1]

  const removeResult = removeNode(tree, sourcePath)
  if (!removeResult) return null

  let adjustedIndex = insertIndex
  if (sourceParentPath === targetPath && sourceIndex < insertIndex) {
    adjustedIndex = insertIndex - 1
  }

  if (sourceParentPath === targetPath && sourceIndex === adjustedIndex) {
    return null
  }

  let adjustedTargetPath = targetPath
  if (sourceParentPath !== targetPath) {
    const sp = parsePath(sourcePath)
    const tp = parsePath(targetPath)
    if (sp.length <= tp.length && sp.length > 0) {
      const commonLen = sp.length - 1
      let sameParent = true
      for (let i = 0; i < commonLen; i++) {
        if (sp[i] !== tp[i]) { sameParent = false; break }
      }
      if (sameParent && commonLen < tp.length && tp[commonLen] > sp[commonLen]) {
        const adjusted = [...tp]
        adjusted[commonLen] = tp[commonLen] - 1
        adjustedTargetPath = adjusted.join(".")
      }
    }
  }

  return insertNode(removeResult.tree, adjustedTargetPath, adjustedIndex, removeResult.removed)
}

export function updateItemId(tree: LayoutNode, path: NodePath, newId: string): LayoutNode | null {
  const node = getNode(tree, path)
  if (!node || node.type !== "item") return null
  const cloned = cloneTree(tree)
  let current: LayoutNode = cloned
  const indices = parsePath(path)
  for (const i of indices) {
    if (current.type !== "layout") return null
    current = current.children[i]
  }
  if (current.type !== "item") return null
  current.id = newId
  return cloned
}

export function updateLayoutDirection(tree: LayoutNode, path: NodePath, newDirection: "vertical" | "horizontal"): LayoutNode | null {
  const node = getNode(tree, path)
  if (!node || node.type !== "layout") return null
  const cloned = cloneTree(tree)
  let current: LayoutNode = cloned
  const indices = parsePath(path)
  for (const i of indices) {
    if (current.type !== "layout") return null
    current = current.children[i]
  }
  if (current.type !== "layout") return null
  current.direction = newDirection
  return cloned
}

import type { NodeSizing } from "./layout-parser"

export function updateNodeSizing(
  tree: LayoutNode, path: NodePath,
  newSizing: NodeSizing,
): LayoutNode | null {
  const node = getNode(tree, path)
  if (!node) return null
  const cloned = cloneTree(tree)
  let current: LayoutNode = cloned
  const indices = parsePath(path)
  for (const i of indices) {
    if (current.type !== "layout") return null
    current = current.children[i]
  }
  delete (current as any).ratioW
  delete (current as any).ratioH
  delete (current as any).remW
  delete (current as any).remH
  Object.assign(current, newSizing)
  return cloned
}

export function updateItemComponent(tree: LayoutNode, path: NodePath, component: string | undefined): LayoutNode | null {
  const node = getNode(tree, path)
  if (!node || node.type !== "item") return null
  const cloned = cloneTree(tree)
  let current: LayoutNode = cloned
  const indices = parsePath(path)
  for (const i of indices) {
    if (current.type !== "layout") return null
    current = current.children[i]
  }
  if (current.type !== "item") return null
  if (component) {
    current.component = component
  } else {
    delete current.component
  }
  return cloned
}
