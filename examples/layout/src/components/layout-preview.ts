import { defineElement, css, useEffect, useHost, useEvent } from "@sparkio/core"
import { parseLayoutNode, renderLayoutNodeWithPath } from "../utils/layout-parser"
import type { LayoutNode } from "../utils/layout-parser"
import { beginLayoutDrag, moveLayoutDrag } from "../utils/drag-handler"
import type { LayoutDragState } from "../utils/drag-handler"
import { findDropTarget, extractLayoutGeometry } from "../utils/drop-target"
import type { DropResult } from "../utils/drop-target"
import { moveNode } from "../utils/tree-ops"

const LayoutPreview = defineElement(
  {
    tag: "layout-preview",
    props: {
      content: { type: String, value: () => "" },
    },
    styles: css`@unocss-placeholder
:host { @apply block; }
.drop-indicator {
  height: 2px;
  background: #3b82f6;
  border-radius: 1px;
}
.drop-indicator-h {
  width: 2px;
  height: 100%;
  background: #3b82f6;
  border-radius: 1px;
}
.node-selected {
  background: rgba(251,146,60,0.2);
  outline: 2px solid #fb923c;
  outline-offset: -2px;
}
.node-hover {
  outline: 2px dashed #fb923c;
  outline-offset: -2px;
}`,
  },
  (props) => {
    const host = useHost()
    const dispatchLayoutChange = useEvent<{ tree: LayoutNode }>("layout-change", {
      bubbles: true,
      composed: true,
    })
    const dispatchNodeSelect = useEvent<{
      path: string | null
      nodeType?: string
      nodeId?: string
      direction?: string
    }>("node-select", { bubbles: true, composed: true })

    useEffect(() => {
      const root = host.current.shadowRoot!
      let dragState: LayoutDragState | null = null
      let currentDropResult: DropResult | null = null
      let draggedEl: HTMLElement | null = null
      let indicatorEl: HTMLElement | null = null
      let selectedPath: string | null = null

      const clearVisualFeedback = () => {
        if (draggedEl) {
          draggedEl.style.opacity = ""
          draggedEl = null
        }
        for (const el of root.querySelectorAll("[data-drop-highlight]")) {
          ;(el as HTMLElement).style.outline = ""
          el.removeAttribute("data-drop-highlight")
        }
        if (indicatorEl) {
          indicatorEl.remove()
          indicatorEl = null
        }
      }

      const showIndicator = (layout: Element, index: number, direction: string) => {
        if (indicatorEl) indicatorEl.remove()
        indicatorEl = document.createElement("div")
        indicatorEl.className = direction === "vertical" ? "drop-indicator" : "drop-indicator-h"
        indicatorEl.setAttribute("data-drop-indicator", "")

        const children = [...layout.children].filter(c => c.hasAttribute("data-path"))
        if (children.length === 0 || index >= children.length) {
          layout.appendChild(indicatorEl)
        } else {
          layout.insertBefore(indicatorEl, children[index])
        }
      }

      const mousedownHandler = (e: MouseEvent) => {
        const target = (e.target as Element).closest("[data-node-type='item']") as HTMLElement | null
        if (!target) return
        const path = target.getAttribute("data-path")
        const nodeId = target.getAttribute("data-node-id")
        if (path == null || nodeId == null) return

        const rect = target.getBoundingClientRect()
        dragState = beginLayoutDrag(path, nodeId, e.clientX, e.clientY, rect.left, rect.top)
        draggedEl = target
        target.style.opacity = "0.4"
        e.preventDefault()
      }

      const mousemoveHandler = (e: MouseEvent) => {
        if (!dragState) return
        moveLayoutDrag(dragState, e.clientX, e.clientY)

        clearVisualFeedback()
        if (draggedEl) draggedEl.style.opacity = "0.4"

        const layouts = extractLayoutGeometry(root)
        const drop = findDropTarget(layouts, e.clientX, e.clientY, dragState.sourcePath)
        currentDropResult = drop

        if (drop) {
          const targetEl = root.querySelector(`[data-node-type='layout'][data-path='${drop.targetPath}']`) as HTMLElement | null
          if (targetEl) {
            targetEl.style.outline = "2px solid #3b82f6"
            targetEl.setAttribute("data-drop-highlight", "")
            const direction = targetEl.getAttribute("data-direction") ?? "vertical"
            showIndicator(targetEl, drop.insertIndex, direction)
          }
        }
      }

      const mouseupHandler = (_e: MouseEvent) => {
        if (!dragState) return
        const drop = currentDropResult
        clearVisualFeedback()

        if (drop) {
          const tree = parseLayoutNode(props.content)
          if (tree) {
            const newTree = moveNode(tree, dragState.sourcePath, drop.targetPath, drop.insertIndex)
            if (newTree) {
              dispatchLayoutChange({ tree: newTree })
            }
          }
        }

        dragState = null
        currentDropResult = null
      }

      // --- click選択 ---
      const clickHandler = (e: MouseEvent) => {
        if (dragState) return
        const target = (e.target as Element).closest("[data-path]") as HTMLElement | null
        if (!target) return

        const path = target.getAttribute("data-path")!
        const nodeType = target.getAttribute("data-node-type")!

        if (selectedPath === path) {
          selectedPath = null
          for (const el of root.querySelectorAll(".node-selected")) el.classList.remove("node-selected")
          dispatchNodeSelect({ path: null })
          return
        }

        for (const el of root.querySelectorAll(".node-selected")) el.classList.remove("node-selected")
        selectedPath = path
        target.classList.add("node-selected")

        if (nodeType === "item") {
          dispatchNodeSelect({ path, nodeType, nodeId: target.getAttribute("data-node-id") ?? "" })
        } else {
          dispatchNodeSelect({ path, nodeType, direction: target.getAttribute("data-direction") ?? "" })
        }
      }

      // --- hoverハイライト ---
      const hoverHandler = (e: MouseEvent) => {
        if (dragState) return
        for (const el of root.querySelectorAll(".node-hover")) el.classList.remove("node-hover")
        const target = (e.target as Element).closest("[data-path]") as HTMLElement | null
        if (!target) return
        if (target.classList.contains("node-selected")) return
        target.classList.add("node-hover")
      }

      const hoverLeaveHandler = () => {
        for (const el of root.querySelectorAll(".node-hover")) el.classList.remove("node-hover")
      }

      root.addEventListener("mousedown", mousedownHandler)
      root.addEventListener("mousemove", mousemoveHandler)
      root.addEventListener("mouseup", mouseupHandler)
      root.addEventListener("click", clickHandler)
      root.addEventListener("mouseover", hoverHandler)
      root.addEventListener("mouseleave", hoverLeaveHandler)
      return () => {
        root.removeEventListener("mousedown", mousedownHandler)
        root.removeEventListener("mousemove", mousemoveHandler)
        root.removeEventListener("mouseup", mouseupHandler)
        root.removeEventListener("click", clickHandler)
        root.removeEventListener("mouseover", hoverHandler)
        root.removeEventListener("mouseleave", hoverLeaveHandler)
      }
    }, [])

    if (!props.content) {
      return `<div class="p-6"><p class="text-gray-400 italic">Preview will appear here</p></div>`
    }

    const node = parseLayoutNode(props.content)
    if (node === null) {
      return `<div class="p-6"><pre data-error class="text-red-500 text-sm font-mono whitespace-pre-wrap">${props.content}</pre></div>`
    }

    return `<div class="p-6">${renderLayoutNodeWithPath(node)}</div>`
  },
)

export default LayoutPreview
