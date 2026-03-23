import { defineElement, css, useEffect, useHost } from "@sparkio/core"
import "./layout-editor"
import "./layout-preview"
import "./layout-toolbox"
import "./layout-node-inspector"
import { parseLayoutNode, createNewNode } from "../utils/layout-parser"
import { findDropTarget, extractLayoutGeometry } from "../utils/drop-target"
import { insertNode, updateItemId, updateLayoutDirection, updateSpacerSize, updateItemWidth, updateItemHeight, removeNode } from "../utils/tree-ops"
import type { DropResult } from "../utils/drop-target"

const LayoutLivePreview = defineElement(
  {
    tag: "layout-live-preview",
    styles: css`@unocss-placeholder
:host { @apply block h-screen; }
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
.toggle-group { display: flex; gap: 4px; }
.toggle-btn {
  padding: 4px 12px;
  font-size: 13px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: #fff;
  color: #374151;
  cursor: pointer;
}
.toggle-btn.active {
  background: #3b82f6;
  color: #fff;
  border-color: #3b82f6;
}`,
  },
  () => {
    const host = useHost()

    useEffect(() => {
      const root = host.current.shadowRoot!
      const editor = root.querySelector("layout-editor")
      if (!editor) return

      // --- view mode toggle ---
      const editorPanel = root.querySelector("[data-panel='editor']") as HTMLElement
      const previewPanel = root.querySelector("[data-panel='preview']") as HTMLElement
      const previewBtn = root.querySelector("button[data-mode='preview']") as HTMLElement
      const editorBtnEl = root.querySelector("button[data-mode='editor']") as HTMLElement

      const setViewMode = (mode: "preview" | "editor") => {
        if (mode === "preview") {
          editorPanel.style.display = "none"
          previewPanel.style.display = ""
          previewBtn.classList.add("active")
          editorBtnEl.classList.remove("active")
        } else {
          editorPanel.style.display = ""
          previewPanel.style.display = "none"
          editorBtnEl.classList.add("active")
          previewBtn.classList.remove("active")
        }
      }

      const toggleClickHandler = ((e: Event) => {
        const target = (e.target as HTMLElement).closest("button[data-mode]") as HTMLElement | null
        if (!target) return
        const mode = target.getAttribute("data-mode") as "preview" | "editor"
        setViewMode(mode)
      }) as EventListener

      const headerEl = root.querySelector("header")
      headerEl?.addEventListener("click", toggleClickHandler)

      // --- helper: editorとpreviewを更新 ---
      const updateAll = (json: string) => {
        const editorEl = root.querySelector("layout-editor") as any
        if (editorEl) {
          editorEl.value = json
          const ta = editorEl.shadowRoot?.querySelector("textarea") as HTMLTextAreaElement
          if (ta) ta.value = json
        }
        const previewEl = root.querySelector("layout-preview") as any
        if (previewEl) previewEl.content = json
      }

      // --- editor → preview ---
      const inputHandler = ((e: Event) => {
        if (!(e instanceof CustomEvent)) return
        const value = e.detail?.value ?? ""
        const preview = root.querySelector("layout-preview") as any
        if (preview) {
          preview.content = value
        }
      }) as EventListener

      // --- preview → editor (layout-change) ---
      const layoutChangeHandler = ((e: Event) => {
        if (!(e instanceof CustomEvent)) return
        const tree = e.detail?.tree
        if (!tree) return
        updateAll(JSON.stringify(tree, null, 2))
      }) as EventListener

      // --- ツールボックスドラッグ ---
      let toolboxDragType: "item" | "vertical" | "horizontal" | "spacer" | null = null
      let currentDropResult: DropResult | null = null
      let indicatorEl: HTMLElement | null = null

      const clearToolboxFeedback = () => {
        const previewEl = root.querySelector("layout-preview") as HTMLElement
        if (!previewEl?.shadowRoot) return
        for (const el of previewEl.shadowRoot.querySelectorAll("[data-drop-highlight]")) {
          ;(el as HTMLElement).style.outline = ""
          el.removeAttribute("data-drop-highlight")
        }
        if (indicatorEl) {
          indicatorEl.remove()
          indicatorEl = null
        }
      }

      const showToolboxIndicator = (layout: Element, index: number, direction: string) => {
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

      const toolboxMousedownHandler = ((e: Event) => {
        const mouseEvent = e as MouseEvent
        const path = mouseEvent.composedPath()
        let toolboxType: string | null = null
        for (const el of path) {
          if (el instanceof HTMLElement && el.hasAttribute("data-toolbox-type")) {
            toolboxType = el.getAttribute("data-toolbox-type")
            break
          }
        }
        if (!toolboxType) return
        toolboxDragType = toolboxType as "item" | "vertical" | "horizontal"
        mouseEvent.preventDefault()
      }) as EventListener

      const toolboxMousemoveHandler = ((e: Event) => {
        if (!toolboxDragType) return
        const mouseEvent = e as MouseEvent
        clearToolboxFeedback()

        const previewEl = root.querySelector("layout-preview") as HTMLElement
        if (!previewEl?.shadowRoot) return
        const layouts = extractLayoutGeometry(previewEl.shadowRoot)
        const drop = findDropTarget(layouts, mouseEvent.clientX, mouseEvent.clientY, null)
        currentDropResult = drop

        if (drop) {
          const targetEl = previewEl.shadowRoot.querySelector(`[data-node-type='layout'][data-path='${drop.targetPath}']`) as HTMLElement | null
          if (targetEl) {
            targetEl.style.outline = "2px solid #3b82f6"
            targetEl.setAttribute("data-drop-highlight", "")
            const direction = targetEl.getAttribute("data-direction") ?? "vertical"
            showToolboxIndicator(targetEl, drop.insertIndex, direction)
          }
        }
      }) as EventListener

      const toolboxMouseupHandler = ((_e: Event) => {
        if (!toolboxDragType) return
        const drop = currentDropResult
        clearToolboxFeedback()

        const previewEl = root.querySelector("layout-preview") as any
        if (previewEl) {
          const tree = parseLayoutNode(previewEl.content)
          const newNode = createNewNode(toolboxDragType!)
          let newTree: import("../utils/layout-parser").LayoutNode | null = null

          if (tree && drop) {
            newTree = insertNode(tree, drop.targetPath, drop.insertIndex, newNode)
          } else if (!tree) {
            newTree = newNode
          }

          if (newTree) {
            updateAll(JSON.stringify(newTree, null, 2))
          }
        }

        toolboxDragType = null
        currentDropResult = null
      }) as EventListener

      // --- inspector配線 ---
      let selectedNodePath: string | null = null

      const nodeSelectHandler = ((e: Event) => {
        if (!(e instanceof CustomEvent)) return
        const detail = e.detail
        selectedNodePath = detail.path
        const inspector = root.querySelector("layout-node-inspector") as any
        if (!inspector) return
        if (detail.path === null) {
          inspector.nodeType = ""
          inspector.nodeId = ""
          inspector.nodeDirection = ""
          inspector.nodeSize = ""
          inspector.nodeWidth = ""
          inspector.nodeHeight = ""
        } else if (detail.nodeType === "item") {
          inspector.nodeType = "item"
          inspector.nodeId = detail.nodeId ?? ""
          inspector.nodeDirection = ""
          inspector.nodeSize = ""
          inspector.nodeWidth = detail.itemWidth ?? "auto"
          inspector.nodeHeight = detail.itemHeight ?? "auto"
        } else if (detail.nodeType === "spacer") {
          inspector.nodeType = "spacer"
          inspector.nodeId = ""
          inspector.nodeDirection = ""
          inspector.nodeSize = detail.spacerSize ?? ""
          inspector.nodeWidth = ""
          inspector.nodeHeight = ""
        } else {
          inspector.nodeType = "layout"
          inspector.nodeId = ""
          inspector.nodeDirection = detail.direction ?? ""
          inspector.nodeSize = ""
          inspector.nodeWidth = ""
          inspector.nodeHeight = ""
        }
      }) as EventListener

      const idChangeHandler = ((e: Event) => {
        if (!(e instanceof CustomEvent)) return
        if (selectedNodePath === null) return
        const previewEl = root.querySelector("layout-preview") as any
        if (!previewEl) return
        const tree = parseLayoutNode(previewEl.content)
        if (!tree) return
        const newTree = updateItemId(tree, selectedNodePath, e.detail.id)
        if (!newTree) return
        updateAll(JSON.stringify(newTree, null, 2))
      }) as EventListener

      const directionChangeHandler = ((e: Event) => {
        if (!(e instanceof CustomEvent)) return
        if (selectedNodePath === null) return
        const previewEl = root.querySelector("layout-preview") as any
        if (!previewEl) return
        const tree = parseLayoutNode(previewEl.content)
        if (!tree) return
        const dir = e.detail.direction as "vertical" | "horizontal"
        const newTree = updateLayoutDirection(tree, selectedNodePath, dir)
        if (!newTree) return
        updateAll(JSON.stringify(newTree, null, 2))
      }) as EventListener

      const sizeChangeHandler = ((e: Event) => {
        if (!(e instanceof CustomEvent)) return
        if (selectedNodePath === null) return
        const previewEl = root.querySelector("layout-preview") as any
        if (!previewEl) return
        const tree = parseLayoutNode(previewEl.content)
        if (!tree) return
        const newTree = updateSpacerSize(tree, selectedNodePath, e.detail.size)
        if (!newTree) return
        updateAll(JSON.stringify(newTree, null, 2))
      }) as EventListener

      const widthChangeHandler = ((e: Event) => {
        if (!(e instanceof CustomEvent)) return
        if (selectedNodePath === null) return
        const previewEl = root.querySelector("layout-preview") as any
        if (!previewEl) return
        const tree = parseLayoutNode(previewEl.content)
        if (!tree) return
        const newTree = updateItemWidth(tree, selectedNodePath, e.detail.width)
        if (!newTree) return
        updateAll(JSON.stringify(newTree, null, 2))
      }) as EventListener

      const heightChangeHandler = ((e: Event) => {
        if (!(e instanceof CustomEvent)) return
        if (selectedNodePath === null) return
        const previewEl = root.querySelector("layout-preview") as any
        if (!previewEl) return
        const tree = parseLayoutNode(previewEl.content)
        if (!tree) return
        const newTree = updateItemHeight(tree, selectedNodePath, e.detail.height)
        if (!newTree) return
        updateAll(JSON.stringify(newTree, null, 2))
      }) as EventListener

      const nodeDeleteHandler = ((_e: Event) => {
        if (selectedNodePath === null) return
        const previewEl = root.querySelector("layout-preview") as any
        if (!previewEl) return
        const tree = parseLayoutNode(previewEl.content)
        if (!tree) return

        if (selectedNodePath === "") {
          updateAll("")
        } else {
          const result = removeNode(tree, selectedNodePath)
          if (!result) return
          updateAll(JSON.stringify(result.tree, null, 2))
        }

        selectedNodePath = null
        const inspector = root.querySelector("layout-node-inspector") as any
        if (inspector) {
          inspector.nodeType = ""
          inspector.nodeId = ""
          inspector.nodeDirection = ""
          inspector.nodeSize = ""
          inspector.nodeWidth = ""
          inspector.nodeHeight = ""
        }
      }) as EventListener

      const previewEl = root.querySelector("layout-preview")
      const inspectorEl = root.querySelector("layout-node-inspector")

      editor.addEventListener("input", inputHandler)
      previewEl?.addEventListener("layout-change", layoutChangeHandler)
      previewEl?.addEventListener("node-select", nodeSelectHandler)
      inspectorEl?.addEventListener("id-change", idChangeHandler)
      inspectorEl?.addEventListener("direction-change", directionChangeHandler)
      inspectorEl?.addEventListener("size-change", sizeChangeHandler)
      inspectorEl?.addEventListener("node-delete", nodeDeleteHandler)
      inspectorEl?.addEventListener("width-change", widthChangeHandler)
      inspectorEl?.addEventListener("height-change", heightChangeHandler)

      root.addEventListener("mousedown", toolboxMousedownHandler)
      root.addEventListener("mousemove", toolboxMousemoveHandler)
      root.addEventListener("mouseup", toolboxMouseupHandler)

      return () => {
        headerEl?.removeEventListener("click", toggleClickHandler)
        editor.removeEventListener("input", inputHandler)
        previewEl?.removeEventListener("layout-change", layoutChangeHandler)
        previewEl?.removeEventListener("node-select", nodeSelectHandler)
        inspectorEl?.removeEventListener("id-change", idChangeHandler)
        inspectorEl?.removeEventListener("direction-change", directionChangeHandler)
        inspectorEl?.removeEventListener("size-change", sizeChangeHandler)
        inspectorEl?.removeEventListener("node-delete", nodeDeleteHandler)
        inspectorEl?.removeEventListener("width-change", widthChangeHandler)
        inspectorEl?.removeEventListener("height-change", heightChangeHandler)
        root.removeEventListener("mousedown", toolboxMousedownHandler)
        root.removeEventListener("mousemove", toolboxMousemoveHandler)
        root.removeEventListener("mouseup", toolboxMouseupHandler)
      }
    }, [])

    return `<div class="flex flex-col h-full">
  <header class="flex items-center justify-between px-4 py-2 bg-gray-100 border-b border-gray-200">
    <h1 class="text-lg font-semibold text-gray-800">Layout Live Preview</h1>
    <div class="toggle-group">
      <button class="toggle-btn active" data-mode="preview">Preview</button>
      <button class="toggle-btn" data-mode="editor">JSON</button>
    </div>
  </header>
  <div class="flex flex-1 min-h-0">
    <div data-panel="editor" class="w-full border-r border-gray-200" style="display:none">
      <layout-editor></layout-editor>
    </div>
    <div data-panel="preview" class="w-full overflow-auto relative">
      <layout-preview></layout-preview>
      <layout-toolbox class="absolute top-2 right-2 z-50"></layout-toolbox>
      <layout-node-inspector class="absolute bottom-2 right-2 z-50"></layout-node-inspector>
    </div>
  </div>
</div>`
  },
)

export default LayoutLivePreview
