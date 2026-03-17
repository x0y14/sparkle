import { defineElement, css, useEffect, useHost, useEvent } from "@sparkio/core"
import * as V from "../../utils/variants"

const UiCloseButton = defineElement(
  {
    tag: "ui-close-button",
    props: {
      size: { type: String, value: () => "md" },
      isDisabled: { type: Boolean, value: () => false },
    },
    styles: css`@unocss-placeholder
:host { @apply inline-flex; }`,
  },
  (props) => {
    const host = useHost()
    const dispatchPress = useEvent("press", { bubbles: true, composed: true })

    useEffect(() => {
      const root = host.current.shadowRoot!
      const btn = root.querySelector("button")
      if (!btn) return
      const handler = () => { if (!props.isDisabled) dispatchPress() }
      btn.addEventListener("click", handler)
      return () => btn.removeEventListener("click", handler)
    }, [props.isDisabled])

    const sizeClass = V.closeButtonSize[props.size as V.Size] || V.closeButtonSize.md
    const disabledClass = props.isDisabled ? "opacity-50 pointer-events-none" : "cursor-pointer"

    return `<button class="inline-flex items-center justify-center rounded-full hover:bg-default-100 transition-colors ${sizeClass} ${disabledClass}" aria-label="Close" ${props.isDisabled ? "disabled" : ""}>
  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M18 6L6 18M6 6l12 12"></path>
  </svg>
</button>`
  },
)

export default UiCloseButton
