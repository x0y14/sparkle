import { defineElement, css } from "@sparkio/core"

const UiScrollShadow = defineElement(
  {
    tag: "ui-scroll-shadow",
    props: {
      orientation: { type: String, value: () => "vertical" },
      size: { type: Number, value: () => 40 },
    },
    styles: css`@unocss-placeholder
:host { @apply block; }`,
  },
  () => {
    return `<div class="relative overflow-auto"><slot></slot></div>`
  },
)

export default UiScrollShadow
