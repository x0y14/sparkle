import { defineElement, css } from "@sparkio/core"

const UiKbd = defineElement(
  {
    tag: "ui-kbd",
    styles: css`@unocss-placeholder
:host { @apply inline-flex; }`,
  },
  () => {
    return `<kbd class="inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-mono bg-default-100 border border-default-200 rounded-md shadow-sm min-w-[1.5em]"><slot></slot></kbd>`
  },
)

export default UiKbd
