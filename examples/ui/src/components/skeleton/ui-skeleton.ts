import { defineElement, css } from "@sparkio/core"

const UiSkeleton = defineElement(
  {
    tag: "ui-skeleton",
    props: {
      isLoaded: { type: Boolean, value: () => false },
    },
    styles: css`@unocss-placeholder
:host { @apply block; }`,
  },
  (props) => {
    if (!props.isLoaded) {
      return `<div class="animate-pulse bg-default-200 rounded-lg" aria-busy="true">
  <div class="opacity-0"><slot></slot></div>
</div>`
    }
    return `<div aria-busy="false"><slot></slot></div>`
  },
)

export default UiSkeleton
