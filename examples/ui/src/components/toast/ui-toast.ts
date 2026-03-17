import { defineElement, css } from "@sparkio/core"
import * as V from "../../utils/variants"

const UiToast = defineElement(
  {
    tag: "ui-toast",
    props: {
      variant: { type: String, value: () => "flat" },
      color: { type: String, value: () => "default" },
      title: { type: String, value: () => "" },
      description: { type: String, value: () => "" },
    },
    styles: css`@unocss-placeholder
:host { @apply block; }`,
  },
  (props) => {
    const variantMap: Record<string, Record<string, string>> = {
      flat: V.flat, bordered: V.bordered, solid: V.solid,
    }
    const colorClass = (variantMap[props.variant] || V.flat)[props.color as V.Color] || V.flat.default

    const titleHtml = props.title
      ? `<div class="font-semibold text-sm">${props.title}</div>`
      : ""
    const descHtml = props.description
      ? `<div class="text-sm opacity-80">${props.description}</div>`
      : ""

    return `<div class="flex items-start gap-3 px-4 py-3 rounded-lg shadow-md border border-default-200 ${colorClass}" role="alert">
  <div class="flex-1">
    ${titleHtml}
    ${descHtml}
  </div>
  <slot></slot>
</div>`
  },
)

export default UiToast
