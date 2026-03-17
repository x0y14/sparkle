import { defineElement, css } from "@sparkio/core"

const UiMenu = defineElement(
  {
    tag: "ui-menu",
    props: {},
    styles: css`@unocss-placeholder
:host { @apply block; }`,
  },
  () => {
    return `<div role="menu" class="flex flex-col py-1"><slot></slot></div>`
  },
)

export default UiMenu
