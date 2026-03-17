import { defineElement, css } from "@sparkio/core"

const sizeMap: Record<string, string> = {
  sm: "w-6 h-6",
  md: "w-8 h-8",
  lg: "w-10 h-10",
}

const UiColorSwatch = defineElement(
  {
    tag: "ui-color-swatch",
    props: {
      color: { type: String, value: () => "#000000" },
      size: { type: String, value: () => "md" },
    },
    styles: css`@unocss-placeholder
:host { @apply inline-block; }`,
  },
  (props) => {
    const sizeClass = sizeMap[props.size] || sizeMap.md

    return `<div class="rounded-md border border-default-200 ${sizeClass}" style="background-color: ${props.color}" role="img" aria-label="${props.color}"></div>`
  },
)

export default UiColorSwatch
