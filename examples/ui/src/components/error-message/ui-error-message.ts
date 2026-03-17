import { defineElement, css } from "@sparkio/core"

const UiErrorMessage = defineElement(
  {
    tag: "ui-error-message",
    styles: css`@unocss-placeholder
:host { @apply block; }`,
  },
  () => `<p class="text-xs text-danger" role="alert"><slot></slot></p>`,
)

export default UiErrorMessage
