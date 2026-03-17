import { defineElement, css } from "@sparkio/core"

const UiBreadcrumbs = defineElement(
  {
    tag: "ui-breadcrumbs",
    props: {
      separator: { type: String, value: () => "/" },
    },
    styles: css`@unocss-placeholder
:host { @apply block; }`,
  },
  () => {
    return `<nav aria-label="Breadcrumbs"><ol class="flex items-center gap-1"><slot></slot></ol></nav>`
  },
)

export default UiBreadcrumbs
