import { defineElement, css, useEffect, useHost, useEvent } from "@sparkio/core"
import * as V from "../../utils/variants"

const UiAlert = defineElement(
  {
    tag: "ui-alert",
    props: {
      color: { type: String, value: () => "default" },
      variant: { type: String, value: () => "flat" },
      title: { type: String, value: () => "" },
      isCloseable: { type: Boolean, value: () => false },
    },
    styles: css`@unocss-placeholder
:host { @apply block; }`,
  },
  (props) => {
    const host = useHost()
    const dispatchClose = useEvent("close", { bubbles: true, composed: true })

    useEffect(() => {
      if (!props.isCloseable) return
      const root = host.current.shadowRoot!
      const btn = root.querySelector("button[aria-label='Close']")
      if (!btn) return
      const handler = () => dispatchClose()
      btn.addEventListener("click", handler)
      return () => btn.removeEventListener("click", handler)
    }, [props.isCloseable])

    const variantMap: Record<string, Record<string, string>> = {
      flat: V.flat, bordered: V.bordered, solid: V.solid,
    }
    const colorClasses = (variantMap[props.variant] || V.flat)[props.color as V.Color] || V.flat.default

    const closeBtn = props.isCloseable
      ? `<button class="ml-auto cursor-pointer opacity-70 hover:opacity-100" aria-label="Close"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"></path></svg></button>`
      : ""

    return `<div role="alert" class="flex items-start gap-3 p-4 rounded-lg ${colorClasses}">
  <slot name="icon"></slot>
  <div class="flex-1">
    <div data-title class="font-medium text-sm">${props.title}</div>
    <div class="text-xs mt-1 opacity-80"><slot></slot></div>
  </div>
  ${closeBtn}
</div>`
  },
)

export default UiAlert
