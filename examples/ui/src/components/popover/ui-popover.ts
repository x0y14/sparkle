import { defineElement, css, useEffect, useHost, useEvent } from "@sparkio/core"

const UiPopover = defineElement(
  {
    tag: "ui-popover",
    props: {
      placement: { type: String, value: () => "bottom" },
      isOpen: { type: Boolean, value: () => false },
    },
    styles: css`@unocss-placeholder
:host { @apply inline-block; }`,
  },
  (props) => {
    const host = useHost()
    const dispatchOpenChange = useEvent<{ isOpen: boolean }>("open-change", { bubbles: true, composed: true })

    useEffect(() => {
      const root = host.current.shadowRoot!
      const trigger = root.querySelector("[data-trigger]")
      if (!trigger) return
      const handler = () => dispatchOpenChange({ isOpen: !props.isOpen })
      trigger.addEventListener("click", handler)
      return () => trigger.removeEventListener("click", handler)
    }, [props.isOpen])

    const placementStyles: Record<string, string> = {
      top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
      bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
      left: "right-full top-1/2 -translate-y-1/2 mr-2",
      right: "left-full top-1/2 -translate-y-1/2 ml-2",
    }

    const placementClass = placementStyles[props.placement] || placementStyles.bottom
    const openClass = props.isOpen ? "block" : "hidden"

    return `<div class="relative inline-flex">
  <div data-trigger class="cursor-pointer">
    <slot name="trigger"></slot>
  </div>
  <div class="absolute z-50 ${placementClass} ${openClass} bg-white border border-default-200 rounded-lg shadow-lg p-3 min-w-[200px]">
    <slot></slot>
  </div>
</div>`
  },
)

export default UiPopover
