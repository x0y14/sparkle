import { defineElement, css } from "@sparkio/core"
import * as V from "./variants"

const UiBadge = defineElement(
  {
    tag: "ui-badge",
    props: {
      content: { type: String, value: () => "" },
      color: { type: String, value: () => "danger" },
      size: { type: String, value: () => "md" },
      variant: { type: String, value: () => "solid" },
      placement: { type: String, value: () => "top-right" },
      isInvisible: { type: Boolean, value: () => false },
    },
    styles: css`@unocss-placeholder
:host { @apply relative flex items-center justify-center; width: 100%; height: 100%; }`,
  },
  (props) => {
    const colorClass = V.solid[props.color as V.Color] || V.solid.danger
    const sizeClass = V.badgeSize[props.size as V.Size] || V.badgeSize.md
    const placementClass = V.badgePlacement[props.placement] || V.badgePlacement["top-right"]

    return `<div class="relative inline-flex">
  <slot></slot>
  <span class="absolute z-10 flex items-center justify-center rounded-full font-medium ${colorClass} ${sizeClass} ${placementClass}"
    ${props.isInvisible ? 'style="display:none"' : ''}>
    ${props.content}
  </span>
</div>`
  },
)

export default UiBadge
