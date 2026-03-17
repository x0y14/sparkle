import { defineElement, css } from "@sparkio/core"

const UiDateInputGroup = defineElement(
  {
    tag: "ui-date-input-group",
    props: {},
    styles: css`@unocss-placeholder
:host { @apply block; }`,
  },
  () => {
    return `<div class="flex items-center bg-default-100 rounded-lg px-3 h-10">
  <slot name="prefix"></slot>
  <slot></slot>
  <slot name="suffix"></slot>
</div>`
  },
)

export default UiDateInputGroup
