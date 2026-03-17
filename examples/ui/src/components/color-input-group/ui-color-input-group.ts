import { defineElement, css } from "@sparkio/core"

const UiColorInputGroup = defineElement(
  {
    tag: "ui-color-input-group",
    props: {},
    styles: css`@unocss-placeholder
:host { @apply block; }`,
  },
  (props) => {
    return `<div class="flex items-center gap-2">
  <slot name="prefix"></slot>
  <slot></slot>
  <slot name="suffix"></slot>
</div>`
  },
)

export default UiColorInputGroup
