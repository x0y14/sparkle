import { defineElement, css } from "@sparkio/core"

const UiFieldError = defineElement(
  {
    tag: "ui-field-error",
    styles: css`@unocss-placeholder
:host { @apply block; }`,
  },
  () => `<p class="text-xs text-danger" role="alert"><slot></slot></p>`,
)

export default UiFieldError
