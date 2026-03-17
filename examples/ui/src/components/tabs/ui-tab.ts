import { defineElement, css } from "@sparkio/core"

const UiTab = defineElement(
  {
    tag: "ui-tab",
    props: {
      key: { type: String, value: () => "" },
      title: { type: String, value: () => "" },
      isDisabled: { type: Boolean, value: () => false },
    },
    styles: css`@unocss-placeholder
:host { @apply block; }`,
  },
  (props) => {
    return `<div><slot></slot></div>`
  },
)

export default UiTab
