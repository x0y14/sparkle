import { defineElement, css, useEffect, useHost, useState } from "@sparkio/core"
import * as V from "../../utils/variants"

const UiTooltip = defineElement(
  {
    tag: "ui-tooltip",
    props: {
      content: { type: String, value: () => "" },
      placement: { type: String, value: () => "top" },
      delay: { type: Number, value: () => 500 },
      color: { type: String, value: () => "default" },
    },
    styles: css`@unocss-placeholder
:host { @apply inline-flex; }`,
  },
  (props) => {
    const host = useHost()
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
      const hostEl = host.current
      let timer: ReturnType<typeof setTimeout>

      const showHandler = () => {
        timer = setTimeout(() => setIsVisible(true), props.delay)
      }
      const hideHandler = () => {
        clearTimeout(timer)
        setIsVisible(false)
      }

      hostEl.addEventListener("mouseenter", showHandler)
      hostEl.addEventListener("mouseleave", hideHandler)
      hostEl.addEventListener("focusin", showHandler)
      hostEl.addEventListener("focusout", hideHandler)
      return () => {
        clearTimeout(timer)
        hostEl.removeEventListener("mouseenter", showHandler)
        hostEl.removeEventListener("mouseleave", hideHandler)
        hostEl.removeEventListener("focusin", showHandler)
        hostEl.removeEventListener("focusout", hideHandler)
      }
    }, [props.delay])

    const placementStyles: Record<string, string> = {
      top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
      bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
      left: "right-full top-1/2 -translate-y-1/2 mr-2",
      right: "left-full top-1/2 -translate-y-1/2 ml-2",
    }

    const placementClass = placementStyles[props.placement] || placementStyles.top
    const visibleClass = isVisible ? "opacity-100 visible" : "opacity-0 invisible"
    const colorClass = props.color === "default"
      ? "bg-default-900 text-white"
      : `bg-${props.color} text-white`

    return `<div class="relative inline-flex">
  <slot></slot>
  <div data-tooltip role="tooltip" class="absolute z-50 px-2 py-1 text-xs rounded-md whitespace-nowrap transition-opacity duration-150 ${colorClass} ${placementClass} ${visibleClass} pointer-events-none">${props.content}</div>
</div>`
  },
)

export default UiTooltip
