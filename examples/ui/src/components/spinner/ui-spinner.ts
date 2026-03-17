import { defineElement, css } from "@sparkio/core"
import * as V from "../../utils/variants"

const UiSpinner = defineElement(
  {
    tag: "ui-spinner",
    props: {
      size: { type: String, value: () => "md" },
      color: { type: String, value: () => "primary" },
      label: { type: String, value: () => "" },
    },
    styles: css`@unocss-placeholder
:host { @apply inline-flex; }`,
  },
  (props) => {
    const sizeClass = V.spinnerSize[props.size as V.Size] || V.spinnerSize.md
    const colorClass = V.textColor[props.color as V.Color] || V.textColor.primary

    return `<div role="status" aria-label="${props.label || "Loading"}" class="inline-flex flex-col items-center gap-2">
  <svg class="animate-spin ${sizeClass} ${colorClass}" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" opacity="0.25"></circle>
    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round"></path>
  </svg>
  <slot></slot>
</div>`
  },
)

export default UiSpinner
