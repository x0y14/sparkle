import { defineElement, css } from "@sparkio/core"

const UiEmptyState = defineElement(
  {
    tag: "ui-empty-state",
    props: {
      title: { type: String, value: () => "" },
      description: { type: String, value: () => "" },
    },
    styles: css`@unocss-placeholder
:host { @apply block; }`,
  },
  (props) => {
    return `<div class="flex flex-col items-center justify-center p-8 text-center">
  <slot name="icon"></slot>
  <h3 class="mt-4 text-lg font-semibold text-foreground">${props.title}</h3>
  <p class="mt-1 text-sm text-default-400">${props.description}</p>
  <div class="mt-4"><slot></slot></div>
</div>`
  },
)

export default UiEmptyState
