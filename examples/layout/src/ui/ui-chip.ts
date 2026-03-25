import { defineElement, css, useEffect, useHost, useEvent } from "@sparkio/core"
import * as V from "./variants"

const UiChip = defineElement(
  {
    tag: "ui-chip",
    props: {
      color: { type: String, value: () => "default" },
      size: { type: String, value: () => "md" },
      variant: { type: String, value: () => "solid" },
      radius: { type: String, value: () => "full" },
      isCloseable: { type: Boolean, value: () => false },
    },
    styles: css`@unocss-placeholder
:host { @apply flex items-center justify-center; width: 100%; height: 100%; }`,
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
      solid: V.solid,
      flat: V.flat,
      bordered: V.bordered,
      light: V.light,
    }
    const colorClasses = (variantMap[props.variant] || V.solid)[props.color as V.Color] || V.solid.default
    const sizeClass = V.chipSize[props.size as V.Size] || V.chipSize.md
    const radiusClass = V.radius[props.radius as V.Radius] || V.radius.full

    const closeBtn = props.isCloseable
      ? `<button class="ml-1 cursor-pointer opacity-70 hover:opacity-100" aria-label="Close">
    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M18 6L6 18M6 6l12 12"></path>
    </svg>
  </button>`
      : ""

    return `<span class="inline-flex items-center ${radiusClass} ${colorClasses} ${sizeClass}">
  <slot name="start-content"></slot>
  <slot></slot>
  <slot name="end-content"></slot>
  ${closeBtn}
</span>`
  },
)

export default UiChip
