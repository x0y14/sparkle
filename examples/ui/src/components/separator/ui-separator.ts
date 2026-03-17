import { defineElement, css } from "@sparkio/core"

const UiSeparator = defineElement(
  {
    tag: "ui-separator",
    props: {
      orientation: { type: String, value: () => "horizontal" },
    },
    styles: css`@unocss-placeholder
:host { @apply block; }`,
  },
  (props) => {
    const cls = props.orientation === "horizontal"
      ? "w-full border-none h-px bg-default-200"
      : "h-full border-none w-px bg-default-200"

    return `<hr role="separator" aria-orientation="${props.orientation}" class="${cls}">`
  },
)

export default UiSeparator
