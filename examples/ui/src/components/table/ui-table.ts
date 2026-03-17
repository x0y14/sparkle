import { defineElement, css } from "@sparkio/core"
import * as V from "../../utils/variants"

const UiTable = defineElement(
  {
    tag: "ui-table",
    props: {
      ariaLabel: { type: String, value: () => "" },
      selectionMode: { type: String, value: () => "none" },
      color: { type: String, value: () => "default" },
    },
    styles: css`@unocss-placeholder
:host { @apply block; }`,
  },
  (props) => {
    const colorClass = props.color !== "default" ? (V.solid[props.color as V.Color] || "") : ""

    return `<div class="overflow-auto ${colorClass}" role="table" aria-label="${props.ariaLabel}" data-selection-mode="${props.selectionMode}">
  <slot></slot>
</div>`
  },
)

export default UiTable
