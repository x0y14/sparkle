import { defineElement, css } from "@sparkio/core"

const UiTextfield = defineElement(
  {
    tag: "ui-textfield",
    props: {
      label: { type: String, value: () => "" },
      description: { type: String, value: () => "" },
      errorMessage: { type: String, value: () => "" },
      isInvalid: { type: Boolean, value: () => false },
    },
    styles: css`@unocss-placeholder
:host { @apply block; }`,
  },
  (props) => {
    const labelHtml = props.label ? `<label class="text-sm font-medium text-foreground">${props.label}</label>` : ""
    const descHtml = !props.isInvalid && props.description ? `<p class="text-xs text-default-400">${props.description}</p>` : ""
    const errorHtml = props.isInvalid && props.errorMessage ? `<p class="text-xs text-danger" role="alert">${props.errorMessage}</p>` : ""

    return `<div class="flex flex-col gap-1.5">${labelHtml}<slot></slot>${descHtml}${errorHtml}</div>`
  },
)

export default UiTextfield
