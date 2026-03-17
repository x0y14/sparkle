import { defineElement, css } from "@sparkio/core"

const variantMap: Record<string, string> = {
  default: "bg-background",
  secondary: "bg-content2",
  tertiary: "bg-content3",
}

const UiSurface = defineElement(
  {
    tag: "ui-surface",
    props: {
      variant: { type: String, value: () => "default" },
    },
    styles: css`@unocss-placeholder
:host { @apply block; }`,
  },
  (props) => {
    const bg = variantMap[props.variant] || variantMap.default
    return `<div class="p-4 rounded-lg ${bg}"><slot></slot></div>`
  },
)

export default UiSurface
