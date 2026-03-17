import { defineElement, css } from "@sparkio/core"

const UiToggleButtonGroup = defineElement(
  {
    tag: "ui-toggle-button-group",
    props: {
      selectionMode: { type: String, value: () => "single" },
    },
    styles: css`@unocss-placeholder
:host { @apply inline-flex; }`,
  },
  () => `<div role="group" class="inline-flex gap-1"><slot></slot></div>`,
)

export default UiToggleButtonGroup
