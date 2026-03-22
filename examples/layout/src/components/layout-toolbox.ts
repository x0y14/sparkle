import { defineElement, css, useEffect, useHost } from "@sparkio/core"

const LayoutToolbox = defineElement(
  {
    tag: "layout-toolbox",
    styles: css`@unocss-placeholder
:host { @apply block; }`,
  },
  () => {
    const host = useHost()

    useEffect(() => {
      const root = host.current.shadowRoot!
      let isDragging = false
      let startX = 0
      let startY = 0
      let startLeft = 0
      let startTop = 0

      const mousedownHandler = (e: MouseEvent) => {
        const handle = (e.target as Element).closest("[data-toolbox-handle]")
        if (!handle) return
        isDragging = true
        startX = e.clientX
        startY = e.clientY
        const hostEl = host.current
        const rect = hostEl.getBoundingClientRect()
        const parentRect = hostEl.offsetParent?.getBoundingClientRect() ?? { x: 0, y: 0 }
        startLeft = rect.x - parentRect.x
        startTop = rect.y - parentRect.y
        e.preventDefault()
      }

      const mousemoveHandler = (e: MouseEvent) => {
        if (!isDragging) return
        const dx = e.clientX - startX
        const dy = e.clientY - startY
        const hostEl = host.current
        hostEl.style.left = `${startLeft + dx}px`
        hostEl.style.top = `${startTop + dy}px`
        hostEl.style.right = "auto"
      }

      const mouseupHandler = () => {
        isDragging = false
      }

      root.addEventListener("mousedown", mousedownHandler)
      window.addEventListener("mousemove", mousemoveHandler)
      window.addEventListener("mouseup", mouseupHandler)
      return () => {
        root.removeEventListener("mousedown", mousedownHandler)
        window.removeEventListener("mousemove", mousemoveHandler)
        window.removeEventListener("mouseup", mouseupHandler)
      }
    }, [])

    return `<div class="bg-white shadow-lg rounded-lg p-2 flex flex-col gap-1">
  <div data-toolbox-handle class="px-2 py-1 text-xs text-gray-400 cursor-move select-none text-center">⠿</div>
  <div data-toolbox-type="vertical" class="px-3 py-2 text-sm cursor-grab rounded hover:bg-gray-100 select-none">Vertical</div>
  <div data-toolbox-type="horizontal" class="px-3 py-2 text-sm cursor-grab rounded hover:bg-gray-100 select-none">Horizontal</div>
  <div data-toolbox-type="item" class="px-3 py-2 text-sm cursor-grab rounded hover:bg-gray-100 select-none">Item</div>
</div>`
  },
)

export default LayoutToolbox
