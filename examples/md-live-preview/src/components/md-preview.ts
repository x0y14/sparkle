import { defineElement, css, useEffect, useHost, useEvent } from "@sparkio/core"
import { findClickOffset } from "../utils/markdoc-highlight"

const MdPreview = defineElement(
  {
    tag: "md-preview",
    props: {
      content: { type: String, value: () => "" },
    },
    styles: css`@unocss-placeholder
:host { @apply block; }
.highlight-active {
  border: 2px solid #3b82f6;
  border-radius: 4px;
}
.highlight-hover {
  border: 2px dashed #93c5fd;
  border-radius: 4px;
}`,
  },
  (props) => {
    const host = useHost()
    const dispatchPreviewClick = useEvent<{ offset: number }>("preview-click", { bubbles: true, composed: true })
    const dispatchHoverEnd = useEvent("preview-hover-end", { bubbles: true, composed: true })

    useEffect(() => {
      const root = host.current.shadowRoot!
      const clickHandler = (e: Event) => {
        const target = e.target as Element
        const offset = findClickOffset(target)
        if (offset != null) dispatchPreviewClick({ offset })
      }
      const hoverHandler = (e: Event) => {
        const target = (e.target as Element).closest("[data-offset-start]")
        for (const el of root.querySelectorAll(".highlight-hover")) {
          el.classList.remove("highlight-hover")
        }
        for (const el of root.querySelectorAll(".highlight-active")) {
          el.classList.remove("highlight-active")
        }
        if (target) target.classList.add("highlight-hover")
      }
      const hoverLeaveHandler = () => {
        for (const el of root.querySelectorAll(".highlight-hover")) {
          el.classList.remove("highlight-hover")
        }
        dispatchHoverEnd()
      }
      root.addEventListener("click", clickHandler)
      root.addEventListener("mouseover", hoverHandler)
      root.addEventListener("mouseleave", hoverLeaveHandler)
      return () => {
        root.removeEventListener("click", clickHandler)
        root.removeEventListener("mouseover", hoverHandler)
        root.removeEventListener("mouseleave", hoverLeaveHandler)
      }
    }, [])

    if (!props.content) {
      return `<div class="p-6 prose prose-sm max-w-none"><p class="text-gray-400 italic">Preview will appear here</p></div>`
    }
    return `<div class="p-6 prose prose-sm max-w-none">${props.content}</div>`
  },
)

export default MdPreview
