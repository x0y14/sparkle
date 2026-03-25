import { defineElement, css, useEffect, useHost, useEvent } from "@sparkio/core"
import * as V from "./variants"

const UiCard = defineElement(
  {
    tag: "ui-card",
    props: {
      variant: { type: String, value: () => "shadow" },
      isPressable: { type: Boolean, value: () => false },
      isDisabled: { type: Boolean, value: () => false },
    },
    styles: css`@unocss-placeholder
:host { @apply block; width: 100%; height: 100%; }`,
  },
  (props) => {
    const host = useHost()
    const dispatchPress = useEvent("press", { bubbles: true, composed: true })

    useEffect(() => {
      if (!props.isPressable || props.isDisabled) return
      const root = host.current.shadowRoot!
      const container = root.querySelector("[data-card]")
      if (!container) return
      const handler = () => dispatchPress()
      container.addEventListener("click", handler)
      return () => container.removeEventListener("click", handler)
    }, [props.isPressable, props.isDisabled])

    const variantClass = V.cardVariant[props.variant] || V.cardVariant.shadow
    const pressableClass = props.isPressable ? "cursor-pointer hover:scale-[1.02] transition-transform" : ""
    const disabledClass = props.isDisabled ? "opacity-50 pointer-events-none" : ""
    const pressableAttrs = props.isPressable ? 'tabindex="0" role="button"' : ""

    return `<div data-card class="overflow-hidden rounded-lg w-full h-full ${variantClass} ${pressableClass} ${disabledClass}" ${pressableAttrs}>
  <div class="p-3"><slot name="header"></slot></div>
  <div class="px-3 py-0"><slot></slot></div>
  <div class="p-3"><slot name="footer"></slot></div>
</div>`
  },
)

export default UiCard
