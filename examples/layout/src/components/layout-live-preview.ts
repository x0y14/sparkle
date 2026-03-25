import { defineElement, css, useEffect, useHost } from "@sparkio/core"
import "./layout-editor"
import "./layout-preview"
import "./layout-toolbox"
import "./layout-node-inspector"
import "../ui/ui-imports"
import { parseLayoutDocument, createNewNode, renderComponentView } from "../utils/layout-parser"
import type { LayoutDocument } from "../utils/layout-parser"
import { findDropTarget, buildLayoutGeometry } from "../utils/drop-target"
import { insertNode, updateItemId, updateLayoutDirection, updateNodeSizing, updateItemComponent, removeNode, getNode } from "../utils/tree-ops"
import type { DropResult } from "../utils/drop-target"
import { computeLayout, pxToFraction } from "../utils/compute-layout"
import type { ResolvedNode } from "../utils/compute-layout"

const LayoutLivePreview = defineElement(
  {
    tag: "layout-live-preview",
    styles: css`@unocss-placeholder
:host { @apply block h-screen; }
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

      const editorPanel = root.querySelector("[data-panel='editor']") as HTMLElement
      const previewPanel = root.querySelector("[data-panel='preview']") as HTMLElement
      const previewBtn = root.querySelector("button[data-mode='preview']") as HTMLElement
      const editorBtnEl = root.querySelector("button[data-mode='editor']") as HTMLElement

      const componentPanel = root.querySelector("[data-panel='component']") as HTMLElement
      const componentBtn = root.querySelector("button[data-mode='component']") as HTMLElement

      const setViewMode = (mode: "preview" | "editor" | "component") => {
        // 1. 現在表示中のパネルからJSONを取得
        let json = ""
        const previewEl = root.querySelector("layout-preview") as any
        const editorEl = root.querySelector("layout-editor") as any
        const componentContainer = root.querySelector("[data-component-container]") as HTMLElement

        if (previewPanel.style.display !== "none" && previewEl) {
          const doc = parseLayoutDocument(previewEl.content)
          if (doc) json = JSON.stringify(doc, null, 2)
        } else if (editorPanel.style.display !== "none" && editorEl) {
          const ta = editorEl.shadowRoot?.querySelector("textarea") as HTMLTextAreaElement
          if (ta) json = ta.value
        } else if (componentPanel?.style.display !== "none" && componentContainer) {
          json = componentContainer.getAttribute("data-json") ?? ""
        }

        // 2. 表示切り替え（loadの前にやる）
        editorPanel.style.display = mode === "editor" ? "" : "none"
        previewPanel.style.display = mode === "preview" ? "" : "none"
        if (componentPanel) componentPanel.style.display = mode === "component" ? "" : "none"
        previewBtn.classList.toggle("active", mode === "preview")
        editorBtnEl.classList.toggle("active", mode === "editor")
        componentBtn?.classList.toggle("active", mode === "component")

        // 3. 対象パネルにJSONをload（パネル表示済み）
        if (mode === "preview") {
          if (previewEl) previewEl.content = json
        } else if (mode === "editor") {
          if (editorEl) {
            editorEl.value = json
            const ta = editorEl.shadowRoot?.querySelector("textarea") as HTMLTextAreaElement
            if (ta) ta.value = json
          }
        } else if (mode === "component") {
          if (componentContainer && componentPanel) {
            componentContainer.setAttribute("data-json", json)
            const doc = parseLayoutDocument(json)
            if (doc) {
              const remSize = parseFloat(getComputedStyle(componentPanel).fontSize) || 16
              const rect = componentPanel.getBoundingClientRect()
              const resolved = computeLayout(doc, rect.width || 800, rect.height || 600, remSize)
              componentContainer.innerHTML = renderComponentView(resolved, true)
            } else {
              componentContainer.innerHTML = ""
            }
          }
        }
      }

      const toggleClickHandler = ((e: Event) => {
        const target = (e.target as HTMLElement).closest("button[data-mode]") as HTMLElement | null
        if (!target) return
        const mode = target.getAttribute("data-mode") as "preview" | "editor" | "component"
        setViewMode(mode)
      }) as EventListener

      const headerEl = root.querySelector("header")
      headerEl?.addEventListener("click", toggleClickHandler)

      const updateAllWithDoc = (doc: LayoutDocument) => {
        updateAll(JSON.stringify(doc, null, 2))
      }

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

      const inputHandler = ((e: Event) => {
        if (!(e instanceof CustomEvent)) return
        const value = e.detail?.value ?? ""
        const preview = root.querySelector("layout-preview") as any
        if (preview) {
          preview.content = value
        }
      }) as EventListener

      const layoutChangeHandler = ((e: Event) => {
        if (!(e instanceof CustomEvent)) return
        const doc = e.detail?.doc as LayoutDocument | undefined
        if (!doc) return
        updateAllWithDoc(doc)
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
        const doc = parseLayoutDocument((previewEl as any).content)
        if (!doc) return
        const panelEl = previewEl.parentElement ?? previewEl
        const panelRect = panelEl.getBoundingClientRect()
        const remSize = parseFloat(getComputedStyle(previewEl).fontSize) || 16
        const resolved = computeLayout(doc, panelRect.width || 800, panelRect.height || 600, remSize)
        const layouts = buildLayoutGeometry(resolved)
        const rootLayoutEl = previewEl.shadowRoot.querySelector("[data-path='']") as HTMLElement
        if (!rootLayoutEl) return
        const rootRect = rootLayoutEl.getBoundingClientRect()
        const mouseXPx = mouseEvent.clientX - rootRect.left
        const mouseYPx = mouseEvent.clientY - rootRect.top
        const drop = findDropTarget(layouts, mouseXPx, mouseYPx, null)
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
          const doc = parseLayoutDocument(previewEl.content)
          const newNode = createNewNode(toolboxDragType!)
          let newDoc: LayoutDocument | null = null

          if (doc && drop) {
            const newRoot = insertNode(doc.node, drop.targetPath, drop.insertIndex, newNode)
            if (newRoot) newDoc = { ...doc, node: newRoot }
          } else if (!doc) {
            newDoc = { settings: { gap: 8, padding: 8 }, node: newNode }
          }

          if (newDoc) {
            updateAllWithDoc(newDoc)
          }
        }

        toolboxDragType = null
        currentDropResult = null
      }) as EventListener

      // --- inspector ---
      let selectedNodePath: string | null = null

      const nodeSelectHandler = ((e: Event) => {
        if (!(e instanceof CustomEvent)) return
        const detail = e.detail
        selectedNodePath = detail.path
        const inspector = root.querySelector("layout-node-inspector") as any
        if (!inspector) return

        const clearInspector = () => {
          inspector.nodeType = ""
          inspector.nodeId = ""
          inspector.nodeDirection = ""
          inspector.nodeSizing = ""
          inspector.nodeRatioW = ""
          inspector.nodeRatioH = ""
          inspector.nodeRemW = ""
          inspector.nodeRemH = ""
          inspector.nodeComponent = ""
        }

        if (detail.path === null) {
          clearInspector()
        } else {
          const previewEl = root.querySelector("layout-preview") as any
          const doc = previewEl ? parseLayoutDocument(previewEl.content) : null
          const node = doc ? getNode(doc.node, detail.path) : null
          const n = node as any

          inspector.nodeType = detail.nodeType
          inspector.nodeId = detail.nodeType === "item" ? (detail.nodeId ?? "") : ""
          inspector.nodeDirection = detail.nodeType === "layout" ? (detail.direction ?? "") : ""
          inspector.nodeSizing = n?.sizing ?? ""
          inspector.nodeRatioW = n?.ratioW ?? ""
          inspector.nodeRatioH = n?.ratioH ?? ""
          inspector.nodeRemW = n?.remW != null ? String(n.remW) : ""
          inspector.nodeRemH = n?.remH != null ? String(n.remH) : ""
          inspector.nodeComponent = n?.component ?? ""
        }
      }) as EventListener

      const idChangeHandler = ((e: Event) => {
        if (!(e instanceof CustomEvent) || selectedNodePath === null) return
        const previewEl = root.querySelector("layout-preview") as any
        if (!previewEl) return
        const doc = parseLayoutDocument(previewEl.content)
        if (!doc) return
        const newRoot = updateItemId(doc.node, selectedNodePath, e.detail.id)
        if (!newRoot) return
        updateAllWithDoc({ ...doc, node: newRoot })
      }) as EventListener

      const directionChangeHandler = ((e: Event) => {
        if (!(e instanceof CustomEvent) || selectedNodePath === null) return
        const previewEl = root.querySelector("layout-preview") as any
        if (!previewEl) return
        const doc = parseLayoutDocument(previewEl.content)
        if (!doc) return
        const dir = e.detail.direction as "vertical" | "horizontal"
        const newRoot = updateLayoutDirection(doc.node, selectedNodePath, dir)
        if (!newRoot) return
        updateAllWithDoc({ ...doc, node: newRoot })
      }) as EventListener

      const findResolved = (r: ResolvedNode, path: string): ResolvedNode | null => {
        if (path === "") return r
        const indices = path.split(".").map(Number)
        let current = r
        for (const i of indices) {
          if (!current.children || i >= current.children.length) return null
          current = current.children[i]
        }
        return current
      }

      const sizingChangeHandler = ((e: Event) => {
        if (!(e instanceof CustomEvent) || selectedNodePath === null) return
        const previewEl = root.querySelector("layout-preview") as any
        if (!previewEl) return
        const doc = parseLayoutDocument(previewEl.content)
        if (!doc) return

        let newSizing = e.detail

        if (e.detail._convert) {
          const panelEl = root.querySelector("[data-panel='preview']") as HTMLElement
          if (panelEl) {
            const remSize = parseFloat(getComputedStyle(panelEl).fontSize) || 16
            const containerRect = panelEl.getBoundingClientRect()
            const resolved = computeLayout(doc, containerRect.width, containerRect.height, remSize)
            const currentResolved = findResolved(resolved, selectedNodePath)
            if (currentResolved) {
              const { w, h } = currentResolved
              if (e.detail.sizing === "ratio") {
                newSizing = {
                  sizing: "ratio" as const,
                  ratioW: pxToFraction(w, containerRect.width),
                  ratioH: pxToFraction(h, containerRect.height),
                }
              } else if (e.detail.sizing === "rem") {
                newSizing = {
                  sizing: "rem" as const,
                  remW: Math.round(w / remSize * 100) / 100,
                  remH: Math.round(h / remSize * 100) / 100,
                }
              } else {
                newSizing = { sizing: "auto" as const }
              }
            }
          }
        }

        const newRoot = updateNodeSizing(doc.node, selectedNodePath, newSizing)
        if (!newRoot) return
        updateAllWithDoc({ ...doc, node: newRoot })
      }) as EventListener

      const componentChangeHandler = ((e: Event) => {
        if (!(e instanceof CustomEvent) || selectedNodePath === null) return
        const previewEl = root.querySelector("layout-preview") as any
        if (!previewEl) return
        const doc = parseLayoutDocument(previewEl.content)
        if (!doc) return
        const newRoot = updateItemComponent(doc.node, selectedNodePath, e.detail.component || undefined)
        if (!newRoot) return
        updateAllWithDoc({ ...doc, node: newRoot })
      }) as EventListener

      const nodeDeleteHandler = ((_e: Event) => {
        if (selectedNodePath === null) return
        const previewEl = root.querySelector("layout-preview") as any
        if (!previewEl) return
        const doc = parseLayoutDocument(previewEl.content)
        if (!doc) return

        if (selectedNodePath === "") {
          updateAll("")
        } else {
          const result = removeNode(doc.node, selectedNodePath)
          if (!result) return
          updateAllWithDoc({ ...doc, node: result.tree })
        }

        selectedNodePath = null
        const inspector = root.querySelector("layout-node-inspector") as any
        if (inspector) {
          inspector.nodeType = ""
          inspector.nodeId = ""
          inspector.nodeDirection = ""
          inspector.nodeSizing = ""
          inspector.nodeRatioW = ""
          inspector.nodeRatioH = ""
          inspector.nodeRemW = ""
          inspector.nodeRemH = ""
        }
      }) as EventListener

      const previewEl = root.querySelector("layout-preview")
      const inspectorEl = root.querySelector("layout-node-inspector")

      editor.addEventListener("input", inputHandler)
      previewEl?.addEventListener("layout-change", layoutChangeHandler)
      previewEl?.addEventListener("node-select", nodeSelectHandler)
      inspectorEl?.addEventListener("id-change", idChangeHandler)
      inspectorEl?.addEventListener("direction-change", directionChangeHandler)
      inspectorEl?.addEventListener("sizing-change", sizingChangeHandler)
      inspectorEl?.addEventListener("component-change", componentChangeHandler)
      inspectorEl?.addEventListener("node-delete", nodeDeleteHandler)

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
        inspectorEl?.removeEventListener("sizing-change", sizingChangeHandler)
        inspectorEl?.removeEventListener("component-change", componentChangeHandler)
        inspectorEl?.removeEventListener("node-delete", nodeDeleteHandler)
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
      <button class="toggle-btn" data-mode="component">Component</button>
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
    <div data-panel="component" class="w-full overflow-auto relative" style="display:none">
      <div data-component-container></div>
    </div>
  </div>
</div>`
  },
)

export default LayoutLivePreview
