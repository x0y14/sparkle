import { defineElement, css } from "@sparkio/core"
import * as V from "../../utils/variants"

const UiText = defineElement(
  {
    tag: "ui-text",
    props: {
      size: { type: String, value: () => "md" },
    },
    styles: css`@unocss-placeholder
:host { @apply block; }`,
  },
  (props) => {
    const sizeClass = V.textSize[props.size as V.Size] || V.textSize.md
    return `<p class="${sizeClass} text-foreground"><slot></slot></p>`
  },
)

export default UiText
