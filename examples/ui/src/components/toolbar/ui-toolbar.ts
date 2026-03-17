import { defineElement, css } from "@sparkio/core"

const UiToolbar = defineElement(
  {
    tag: "ui-toolbar",
    props: {
      orientation: { type: String, value: () => "horizontal" },
    },
    styles: css`@unocss-placeholder
:host { @apply block; }`,
  },
  (props) => {
    const flexDir = props.orientation === "vertical" ? "flex-col" : "flex-row"
    return `<div role="toolbar" aria-orientation="${props.orientation}" class="flex ${flexDir} items-center gap-2"><slot></slot></div>`
  },
)

export default UiToolbar
