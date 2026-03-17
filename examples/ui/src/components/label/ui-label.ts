import { defineElement, css } from "@sparkio/core"

const UiLabel = defineElement(
  {
    tag: "ui-label",
    styles: css`@unocss-placeholder
:host { @apply inline-block; }`,
  },
  () => `<label class="text-sm font-medium text-foreground"><slot></slot></label>`,
)

export default UiLabel
