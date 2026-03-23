import { defineElement, css, useEffect, useHost, useEvent } from "@sparkio/core"

const LayoutNodeInspector = defineElement(
  {
    tag: "layout-node-inspector",
    props: {
      nodeType: { type: String, value: () => "" },
      nodeId: { type: String, value: () => "" },
      nodeDirection: { type: String, value: () => "" },
      nodeSize: { type: String, value: () => "" },
      nodeWidth: { type: String, value: () => "" },
      nodeHeight: { type: String, value: () => "" },
    },
    styles: css`@unocss-placeholder
:host { @apply block; }`,
  },
  (props) => {
    const host = useHost()
    const dispatchIdChange = useEvent<{ id: string }>("id-change", { bubbles: true, composed: true })
    const dispatchDirectionChange = useEvent<{ direction: string }>("direction-change", { bubbles: true, composed: true })
    const dispatchSizeChange = useEvent<{ size: string }>("size-change", { bubbles: true, composed: true })
    const dispatchWidthChange = useEvent<{ width: string }>("width-change", { bubbles: true, composed: true })
    const dispatchHeightChange = useEvent<{ height: string }>("height-change", { bubbles: true, composed: true })
    const dispatchNodeDelete = useEvent("node-delete", { bubbles: true, composed: true })

    useEffect(() => {
      const root = host.current.shadowRoot!
      const changeHandler = (e: Event) => {
        const input = e.target as HTMLInputElement
        const field = input.closest("[data-field]")?.getAttribute("data-field")
        if (field === "id") {
          dispatchIdChange({ id: input.value })
        } else if (field === "direction") {
          dispatchDirectionChange({ direction: input.value })
        } else if (field === "size") {
          dispatchSizeChange({ size: input.value })
        } else if (field === "width") {
          dispatchWidthChange({ width: input.value })
        } else if (field === "height") {
          dispatchHeightChange({ height: input.value })
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

    if (props.nodeType === "item") {
      return `<div data-inspector class="bg-white shadow-lg rounded-lg p-3 text-sm flex flex-col gap-2">
  <div data-field="type" class="text-gray-500">item</div>
  <div data-field="id" class="flex items-center gap-2">
    <span class="text-gray-500">id:</span>
    <input type="text" value="${props.nodeId}" class="border border-gray-300 rounded px-2 py-1 text-sm flex-1" />
  </div>
  <div data-field="width" class="flex items-center gap-2">
    <span class="text-gray-500">width:</span>
    <input type="text" value="${props.nodeWidth}" class="border border-gray-300 rounded px-2 py-1 text-sm flex-1" />
  </div>
  <div data-field="height" class="flex items-center gap-2">
    <span class="text-gray-500">height:</span>
    <input type="text" value="${props.nodeHeight}" class="border border-gray-300 rounded px-2 py-1 text-sm flex-1" />
  </div>
  ${deleteBtn}
</div>`
    }

    if (props.nodeType === "spacer") {
      return `<div data-inspector class="bg-white shadow-lg rounded-lg p-3 text-sm flex flex-col gap-2">
  <div data-field="type" class="text-gray-500">spacer</div>
  <div data-field="size" class="flex items-center gap-2">
    <span class="text-gray-500">size:</span>
    <input type="text" value="${props.nodeSize}" class="border border-gray-300 rounded px-2 py-1 text-sm flex-1" />
  </div>
  ${deleteBtn}
</div>`
    }

    return `<div data-inspector class="bg-white shadow-lg rounded-lg p-3 text-sm flex flex-col gap-2">
  <div data-field="type" class="text-gray-500">layout</div>
  <div data-field="direction" class="flex items-center gap-2">
    <span class="text-gray-500">direction:</span>
    <input type="text" value="${props.nodeDirection}" class="border border-gray-300 rounded px-2 py-1 text-sm flex-1" />
  </div>
  ${deleteBtn}
</div>`
  },
)

export default LayoutNodeInspector
