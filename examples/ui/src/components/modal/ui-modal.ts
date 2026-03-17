import { defineElement, css, useEffect, useHost, useEvent } from "@sparkio/core"

const sizeMap: Record<string, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  full: "max-w-full",
}

const UiModal = defineElement(
  {
    tag: "ui-modal",
    props: {
      isOpen: { type: Boolean, value: () => false },
      size: { type: String, value: () => "md" },
      placement: { type: String, value: () => "center" },
      backdrop: { type: String, value: () => "opaque" },
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
    const backdropClass = props.backdrop === "opaque"
      ? "bg-black/50"
      : props.backdrop === "blur"
        ? "bg-black/30 backdrop-blur-sm"
        : "bg-transparent"

    const placementClass = props.placement === "top"
      ? "items-start pt-16"
      : props.placement === "bottom"
        ? "items-end pb-16"
        : "items-center"

    return `<dialog class="${openClass} fixed inset-0 z-50 ${placementClass} justify-center w-full h-full bg-transparent" ${props.isOpen ? "open" : ""}>
  <div data-backdrop class="fixed inset-0 ${backdropClass}"></div>
  <div class="relative z-10 w-full ${sizeClass} mx-4 bg-white rounded-xl shadow-xl">
    <slot name="header"></slot>
    <slot name="body"></slot>
    <slot></slot>
    <slot name="footer"></slot>
  </div>
</dialog>`
  },
)

export default UiModal
