import { defineElement, css } from "@sparkio/core"

const UiButtonGroup = defineElement(
  {
    tag: "ui-button-group",
    props: {
      variant: { type: String, value: () => "solid" },
      color: { type: String, value: () => "primary" },
      size: { type: String, value: () => "md" },
      isDisabled: { type: Boolean, value: () => false },
    },
    styles: css`@unocss-placeholder
:host { @apply inline-flex; }`,
  },
  () => {
    return `<div role="group" class="inline-flex [&>*:not(:first-child):not(:last-child)]:rounded-none [&>*:first-child]:rounded-r-none [&>*:last-child]:rounded-l-none"><slot></slot></div>`
  },
)

export default UiButtonGroup
