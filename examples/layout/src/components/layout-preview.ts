import { defineElement, css, useEffect, useHost, useEvent } from "@sparkio/core"
import { parseLayoutDocument, renderResolvedNodeWithPath } from "../utils/layout-parser"
import type { LayoutDocument } from "../utils/layout-parser"
import { beginLayoutDrag, computeDragPosition } from "../utils/drag-handler"
import type { LayoutDragState } from "../utils/drag-handler"
import { findDropTarget, buildLayoutGeometry } from "../utils/drop-target"
import type { DropResult } from "../utils/drop-target"
import { moveNode } from "../utils/tree-ops"
import { computeLayout } from "../utils/compute-layout"

const LayoutPreview = defineElement(
  {
    tag: "layout-preview",
    props: {
      content: { type: String, value: () => "" },
    },
    styles: css`@unocss-placeholder
:host { @apply block; }
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
    const dispatchLayoutChange = useEvent<{ doc: LayoutDocument }>("layout-change", {
      bubbles: true,
      composed: true,
    })
    const dispatchNodeSelect = useEvent<{
      path: string | null
      nodeType?: string
      nodeId?: string
      direction?: string
      spacerSize?: string
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
        indicatorEl.setAttribute("data-drop-indicator", "")

        const children = [...layout.children].filter(c => c.hasAttribute("data-path"))

        if (direction === "vertical") {
          let topPx: number
          if (children.length === 0 || index >= children.length) {
            const lastChild = children[children.length - 1] as HTMLElement | undefined
            topPx = lastChild ? parseFloat(lastChild.style.top) + parseFloat(lastChild.style.height) : 0
          } else {
            topPx = parseFloat((children[index] as HTMLElement).style.top)
          }
          indicatorEl.style.cssText = `position: absolute; left: 0; right: 0; top: ${topPx}px; height: 2px; background: #3b82f6; border-radius: 1px;`
        } else {
          let leftPx: number
          if (children.length === 0 || index >= children.length) {
            const lastChild = children[children.length - 1] as HTMLElement | undefined
            leftPx = lastChild ? parseFloat(lastChild.style.left) + parseFloat(lastChild.style.width) : 0
          } else {
            leftPx = parseFloat((children[index] as HTMLElement).style.left)
          }
          indicatorEl.style.cssText = `position: absolute; top: 0; bottom: 0; left: ${leftPx}px; width: 2px; background: #3b82f6; border-radius: 1px;`
        }

        layout.appendChild(indicatorEl)
      }

      const mousedownHandler = (e: Event) => {
        const me = e as MouseEvent
        const target = (me.target as Element).closest("[data-node-type='item'], [data-node-type='spacer']") as HTMLElement | null
        if (!target) return
        const path = target.getAttribute("data-path")
        if (path == null) return
        const nodeId = target.getAttribute("data-node-id") ?? ""

        const nodeX = parseFloat(target.style.left) || 0
        const nodeY = parseFloat(target.style.top) || 0

        dragState = beginLayoutDrag(path, nodeId, me.clientX, me.clientY, nodeX, nodeY)
        draggedEl = target
        target.style.opacity = "0.4"
        me.preventDefault()
      }

      const mousemoveHandler = (e: Event) => {
        const me = e as MouseEvent
        if (!dragState) return

        const pos = computeDragPosition(dragState, me.clientX, me.clientY)
        if (draggedEl) {
          draggedEl.style.left = `${pos.x}px`
          draggedEl.style.top = `${pos.y}px`
        }

        clearVisualFeedback()
        if (draggedEl) draggedEl.style.opacity = "0.4"

        const doc = parseLayoutDocument(props.content)
        if (!doc) return
        const containerEl = host.current.parentElement ?? host.current
        const containerRect = containerEl.getBoundingClientRect()
        const remSize = parseFloat(getComputedStyle(host.current).fontSize) || 16
        const resolved = computeLayout(doc, containerRect.width || 800, containerRect.height || 600, remSize)
        const layouts = buildLayoutGeometry(resolved)
        const rootEl = root.querySelector("[data-path='']") as HTMLElement
        if (!rootEl) return
        const rootRect = rootEl.getBoundingClientRect()
        const mouseXPx = me.clientX - rootRect.left
        const mouseYPx = me.clientY - rootRect.top
        const drop = findDropTarget(layouts, mouseXPx, mouseYPx, dragState.sourcePath)
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

      const mouseupHandler = (_e: Event) => {
        if (!dragState) return
        const drop = currentDropResult
        clearVisualFeedback()

        if (drop) {
          const doc = parseLayoutDocument(props.content)
          if (doc) {
            const newRoot = moveNode(doc.node, dragState.sourcePath, drop.targetPath, drop.insertIndex)
            if (newRoot) {
              dispatchLayoutChange({ doc: { ...doc, node: newRoot } })
            }
          }
        }

        dragState = null
        currentDropResult = null
      }

      const clickHandler = (e: Event) => {
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
          dispatchNodeSelect({
            path, nodeType,
            nodeId: target.getAttribute("data-node-id") ?? "",
          })
        } else if (nodeType === "spacer") {
          dispatchNodeSelect({ path, nodeType, spacerSize: target.getAttribute("data-spacer-size") ?? "" })
        } else {
          dispatchNodeSelect({ path, nodeType, direction: target.getAttribute("data-direction") ?? "" })
        }
      }

      const hoverHandler = (e: Event) => {
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

    const doc = parseLayoutDocument(props.content)
    if (doc === null) {
      return `<div class="p-6"><pre data-error class="text-red-500 text-sm font-mono whitespace-pre-wrap">${props.content}</pre></div>`
    }

    const containerEl = host.current.parentElement ?? host.current
    const rect = containerEl.getBoundingClientRect()
    const cw = rect.width || 800
    const ch = rect.height || 600
    const remSz = parseFloat(getComputedStyle(host.current).fontSize) || 16
    const resolved = computeLayout(doc, cw, ch, remSz)

    return `<div class="p-0">${renderResolvedNodeWithPath(resolved, "", true)}</div>`
  },
)

export default LayoutPreview
