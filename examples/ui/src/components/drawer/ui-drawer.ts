import { defineElement, css, useEffect, useHost, useEvent } from "@sparkio/core"

const sizeMap: Record<string, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  full: "max-w-full",
}

const UiDrawer = defineElement(
  {
    tag: "ui-drawer",
    props: {
      isOpen: { type: Boolean, value: () => false },
      size: { type: String, value: () => "md" },
      placement: { type: String, value: () => "right" },
      isDismissable: { type: Boolean, value: () => true },
    },
    styles: css`@unocss-placeholder
:host { @apply block; }`,
  },
  (props) => {
    const host = useHost()
    const dispatchOpenChange = useEvent<{ isOpen: boolean }>("open-change", { bubbles: true, composed: true })

    useEffect(() => {
      const root = host.current.shadowRoot!
      const backdrop = root.querySelector("[data-backdrop]") as HTMLElement
      if (!backdrop || !props.isDismissable) return
      const handler = (e: Event) => {
        if (e.target === backdrop) dispatchOpenChange({ isOpen: false })
      }
      backdrop.addEventListener("click", handler)
      return () => backdrop.removeEventListener("click", handler)
    }, [props.isOpen, props.isDismissable])

    const sizeClass = sizeMap[props.size] || sizeMap.md
    const openClass = props.isOpen ? "flex" : "hidden"

    const placementStyles: Record<string, { container: string; transform: string }> = {
      right: { container: "right-0 top-0 h-full", transform: props.isOpen ? "translate-x-0" : "translate-x-full" },
      left: { container: "left-0 top-0 h-full", transform: props.isOpen ? "translate-x-0" : "-translate-x-full" },
      top: { container: "top-0 left-0 w-full", transform: props.isOpen ? "translate-y-0" : "-translate-y-full" },
      bottom: { container: "bottom-0 left-0 w-full", transform: props.isOpen ? "translate-y-0" : "translate-y-full" },
    }

    const p = placementStyles[props.placement] || placementStyles.right
    const isHorizontal = props.placement === "left" || props.placement === "right"
    const panelSize = isHorizontal ? `${sizeClass} w-full h-full` : "w-full max-h-96"

    return `<dialog class="${openClass} fixed inset-0 z-50 bg-transparent w-full h-full" ${props.isOpen ? "open" : ""}>
  <div data-backdrop class="fixed inset-0 bg-black/50"></div>
  <div class="fixed ${p.container} z-10 ${panelSize} bg-white shadow-xl transition-transform duration-300 ${p.transform}">
    <slot name="header"></slot>
    <slot name="body"></slot>
    <slot></slot>
    <slot name="footer"></slot>
  </div>
</dialog>`
  },
)

export default UiDrawer
