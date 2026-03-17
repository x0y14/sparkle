import { defineElement, css } from "@sparkio/core"

const UiHeader = defineElement(
  {
    tag: "ui-header",
    props: {
      level: { type: Number, value: () => 3 },
    },
    styles: css`@unocss-placeholder
:host { @apply block; }`,
  },
  (props) => {
    const lvl = props.level >= 1 && props.level <= 6 ? props.level : 3
    return `<h${lvl} class="font-semibold text-foreground"><slot></slot></h${lvl}>`
  },
)

export default UiHeader
