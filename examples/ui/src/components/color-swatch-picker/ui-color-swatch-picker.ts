import { defineElement, css, useEffect, useHost, useEvent } from "@sparkio/core"

const UiColorSwatchPicker = defineElement(
  {
    tag: "ui-color-swatch-picker",
    props: {},
    styles: css`@unocss-placeholder
:host { @apply block; }`,
  },
  (props) => {
    const host = useHost()
    const dispatchChange = useEvent<{ color: string }>("change", { bubbles: true, composed: true })

    useEffect(() => {
      const hostEl = host.current
      const handler = (e: Event) => {
        const target = e.target as HTMLElement
        if (target.tagName === "UI-COLOR-SWATCH") {
          const color = target.getAttribute("color") || "#000000"
          dispatchChange({ color })
        }
      }
      hostEl.addEventListener("click", handler)
      return () => hostEl.removeEventListener("click", handler)
    }, [])

    return `<div class="flex flex-wrap gap-2"><slot></slot></div>`
  },
)

export default UiColorSwatchPicker
