import { defineElement, css } from "@sparkio/core"

const UiListBoxSection = defineElement(
  {
    tag: "ui-list-box-section",
    props: {
      title: { type: String, value: () => "" },
    },
    styles: css`@unocss-placeholder
:host { @apply block; }`,
  },
  (props) => {
    const titleHtml = props.title
      ? `<div class="px-3 py-1 text-xs font-semibold text-default-400">${props.title}</div>`
      : ""
    return `<div role="group">${titleHtml}<slot></slot></div>`
  },
)

export default UiListBoxSection
