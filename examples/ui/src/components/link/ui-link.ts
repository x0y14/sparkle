import { defineElement, css } from "@sparkio/core"
import * as V from "../../utils/variants"

const underlineMap: Record<string, string> = {
  none: "",
  hover: "hover:underline",
  always: "underline",
  active: "active:underline",
}

const UiLink = defineElement(
  {
    tag: "ui-link",
    props: {
      href: { type: String, value: () => "" },
      color: { type: String, value: () => "primary" },
      isExternal: { type: Boolean, value: () => false },
      isDisabled: { type: Boolean, value: () => false },
      underline: { type: String, value: () => "none" },
    },
    styles: css`@unocss-placeholder
:host { @apply inline; }`,
  },
  (props) => {
    const colorClass = V.textColor[props.color as V.Color] || V.textColor.primary
    const ulClass = underlineMap[props.underline] || ""
    const disabledClass = props.isDisabled ? "opacity-50 pointer-events-none" : "hover:opacity-80"
    const externalAttrs = props.isExternal ? 'target="_blank" rel="noopener noreferrer"' : ""
    const disabledAttrs = props.isDisabled ? 'aria-disabled="true" tabindex="-1"' : ""

    const externalIcon = props.isExternal
      ? `<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"></path>
  </svg>`
      : ""

    return `<a href="${props.href}" class="inline-flex items-center gap-1 transition-opacity ${colorClass} ${ulClass} ${disabledClass}" ${externalAttrs} ${disabledAttrs}>
  <slot></slot>
  ${externalIcon}
</a>`
  },
)

export default UiLink
