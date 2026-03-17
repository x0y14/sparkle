import { defineElement, css } from "@sparkio/core"

const UiAccordion = defineElement(
  {
    tag: "ui-accordion",
    props: {
      selectionMode: { type: String, value: () => "single" },
      variant: { type: String, value: () => "light" },
      isDisabled: { type: Boolean, value: () => false },
    },
    styles: css`@unocss-placeholder
:host { @apply block; }`,
  },
  (props) => {
    const disabledClass = props.isDisabled ? "opacity-50 pointer-events-none" : ""
    return `<div class="flex flex-col ${disabledClass}" role="presentation"><slot></slot></div>`
  },
)

export default UiAccordion
