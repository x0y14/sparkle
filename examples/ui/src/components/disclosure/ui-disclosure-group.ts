import { defineElement, css } from "@sparkio/core"

const UiDisclosureGroup = defineElement(
  {
    tag: "ui-disclosure-group",
    props: {},
    styles: css`@unocss-placeholder
:host { @apply block; }`,
  },
  () => {
    return `<div class="flex flex-col gap-2"><slot></slot></div>`
  },
)

export default UiDisclosureGroup
