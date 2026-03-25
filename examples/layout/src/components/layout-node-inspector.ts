import { defineElement, css, useEffect, useHost, useEvent } from "@sparkio/core"
import { AVAILABLE_COMPONENTS } from "../utils/layout-parser"

const LayoutNodeInspector = defineElement(
  {
    tag: "layout-node-inspector",
    props: {
      nodeType: { type: String, value: () => "" },
      nodeId: { type: String, value: () => "" },
      nodeDirection: { type: String, value: () => "" },
      nodeSizing: { type: String, value: () => "" },
      nodeRatioW: { type: String, value: () => "" },
      nodeRatioH: { type: String, value: () => "" },
      nodeRemW: { type: String, value: () => "" },
      nodeRemH: { type: String, value: () => "" },
      nodeComponent: { type: String, value: () => "" },
    },
    styles: css`@unocss-placeholder
:host { @apply block; }`,
  },
  (props) => {
    const host = useHost()
    const dispatchIdChange = useEvent<{ id: string }>("id-change", { bubbles: true, composed: true })
    const dispatchDirectionChange = useEvent<{ direction: string }>("direction-change", { bubbles: true, composed: true })
    const dispatchSizingChange = useEvent<{ sizing: string; ratioW?: string; ratioH?: string; remW?: number; remH?: number; _convert?: boolean }>("sizing-change", { bubbles: true, composed: true })
    const dispatchComponentChange = useEvent<{ component: string | undefined }>("component-change", { bubbles: true, composed: true })
    const dispatchNodeDelete = useEvent("node-delete", { bubbles: true, composed: true })

    useEffect(() => {
      const root = host.current.shadowRoot!
      const changeHandler = (e: Event) => {
        const input = e.target as HTMLInputElement | HTMLSelectElement
        const field = input.closest("[data-field]")?.getAttribute("data-field")
        if (field === "id") {
          dispatchIdChange({ id: input.value })
        } else if (field === "direction") {
          dispatchDirectionChange({ direction: input.value })
        } else if (field === "sizing") {
          if (input.value === "ratio") {
            dispatchSizingChange({ sizing: "ratio", ratioW: "1/1", ratioH: "1/1", _convert: true })
          } else if (input.value === "rem") {
            dispatchSizingChange({ sizing: "rem", remW: 10, remH: 5, _convert: true })
          } else {
            dispatchSizingChange({ sizing: "auto" })
          }
        } else if (field === "ratioW" || field === "ratioH") {
          const rw = (root.querySelector("[data-field='ratioW'] input") as HTMLInputElement)?.value || "1/1"
          const rh = (root.querySelector("[data-field='ratioH'] input") as HTMLInputElement)?.value || "1/1"
          dispatchSizingChange({ sizing: "ratio", ratioW: rw, ratioH: rh })
        } else if (field === "remW" || field === "remH") {
          const rw = (root.querySelector("[data-field='remW'] input") as HTMLInputElement)?.value
          const rh = (root.querySelector("[data-field='remH'] input") as HTMLInputElement)?.value
          dispatchSizingChange({ sizing: "rem", remW: rw ? parseFloat(rw) : 10, remH: rh ? parseFloat(rh) : 5 })
        } else if (field === "component") {
          dispatchComponentChange({ component: (input as HTMLSelectElement).value || undefined })
        }
      }
      const clickHandler = (e: Event) => {
        const btn = (e.target as Element).closest("[data-action='delete']")
        if (btn) dispatchNodeDelete(undefined)
      }
      root.addEventListener("change", changeHandler)
      root.addEventListener("click", clickHandler)
      return () => {
        root.removeEventListener("change", changeHandler)
        root.removeEventListener("click", clickHandler)
      }
    }, [])

    if (!props.nodeType) return ``

    const deleteBtn = `<button data-action="delete" class="px-2 py-1 text-xs text-red-500 border border-red-300 rounded hover:bg-red-50">Delete</button>`

    const sizing = props.nodeSizing || "auto"
    const sizingSelect = `<div data-field="sizing" class="flex items-center gap-2">
    <span class="text-gray-500">sizing:</span>
    <select class="border border-gray-300 rounded px-2 py-1 text-sm flex-1">
      <option value="auto"${sizing === "auto" ? " selected" : ""}>auto</option>
      <option value="ratio"${sizing === "ratio" ? " selected" : ""}>ratio</option>
      <option value="rem"${sizing === "rem" ? " selected" : ""}>rem</option>
    </select>
  </div>`

    const ratioFields = sizing === "ratio" ? `<div data-field="ratioW" class="flex items-center gap-2">
    <span class="text-gray-500">ratioW:</span>
    <input type="text" value="${props.nodeRatioW}" class="border border-gray-300 rounded px-2 py-1 text-sm flex-1" />
  </div>
  <div data-field="ratioH" class="flex items-center gap-2">
    <span class="text-gray-500">ratioH:</span>
    <input type="text" value="${props.nodeRatioH}" class="border border-gray-300 rounded px-2 py-1 text-sm flex-1" />
  </div>` : ""

    const remFields = sizing === "rem" ? `<div data-field="remW" class="flex items-center gap-2">
    <span class="text-gray-500">remW:</span>
    <input type="number" step="0.5" value="${props.nodeRemW}" class="border border-gray-300 rounded px-2 py-1 text-sm flex-1" />
  </div>
  <div data-field="remH" class="flex items-center gap-2">
    <span class="text-gray-500">remH:</span>
    <input type="number" step="0.5" value="${props.nodeRemH}" class="border border-gray-300 rounded px-2 py-1 text-sm flex-1" />
  </div>` : ""

    const componentOptions = AVAILABLE_COMPONENTS.map(c =>
      `<option value="${c.tag}"${props.nodeComponent === c.tag ? " selected" : ""}>${c.label}</option>`
    ).join("")
    const componentSelect = `<div data-field="component" class="flex items-center gap-2">
    <span class="text-gray-500">component:</span>
    <select class="border border-gray-300 rounded px-2 py-1 text-sm flex-1">
      <option value=""${!props.nodeComponent ? " selected" : ""}>none</option>
      ${componentOptions}
    </select>
  </div>`

    if (props.nodeType === "item") {
      return `<div data-inspector class="bg-white shadow-lg rounded-lg p-3 text-sm flex flex-col gap-2">
  <div data-field="type" class="text-gray-500">item</div>
  <div data-field="id" class="flex items-center gap-2">
    <span class="text-gray-500">id:</span>
    <input type="text" value="${props.nodeId}" class="border border-gray-300 rounded px-2 py-1 text-sm flex-1" />
  </div>
  ${componentSelect}
  ${sizingSelect}
  ${ratioFields}
  ${remFields}
  ${deleteBtn}
</div>`
    }

    if (props.nodeType === "spacer") {
      return `<div data-inspector class="bg-white shadow-lg rounded-lg p-3 text-sm flex flex-col gap-2">
  <div data-field="type" class="text-gray-500">spacer</div>
  ${sizingSelect}
  ${ratioFields}
  ${remFields}
  ${deleteBtn}
</div>`
    }

    return `<div data-inspector class="bg-white shadow-lg rounded-lg p-3 text-sm flex flex-col gap-2">
  <div data-field="type" class="text-gray-500">layout</div>
  <div data-field="direction" class="flex items-center gap-2">
    <span class="text-gray-500">direction:</span>
    <input type="text" value="${props.nodeDirection}" class="border border-gray-300 rounded px-2 py-1 text-sm flex-1" />
  </div>
  ${sizingSelect}
  ${ratioFields}
  ${remFields}
  ${deleteBtn}
</div>`
  },
)

export default LayoutNodeInspector
