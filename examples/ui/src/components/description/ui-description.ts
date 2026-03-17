import { defineElement, css } from "@sparkio/core"

const UiDescription = defineElement(
  {
    tag: "ui-description",
    styles: css`@unocss-placeholder
:host { @apply block; }`,
  },
  () => `<p class="text-xs text-default-400"><slot></slot></p>`,
)

export default UiDescription
