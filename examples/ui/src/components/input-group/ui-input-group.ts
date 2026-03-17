import { defineElement, css } from "@sparkio/core"
import * as V from "../../utils/variants"

const UiInputGroup = defineElement(
  {
    tag: "ui-input-group",
    props: {
      variant: { type: String, value: () => "flat" },
      size: { type: String, value: () => "md" },
    },
    styles: css`@unocss-placeholder
:host { @apply block; }`,
  },
  (props) => {
    const variantClass = V.inputVariant[props.variant] || V.inputVariant.flat
    const sizeClass = V.inputSize[props.size as V.Size] || V.inputSize.md
    return `<div class="flex items-center ${variantClass} ${sizeClass} rounded-lg"><slot name="prefix"></slot><slot></slot><slot name="suffix"></slot></div>`
  },
)

export default UiInputGroup
