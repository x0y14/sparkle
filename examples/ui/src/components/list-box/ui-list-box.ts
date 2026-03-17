import { defineElement, css } from "@sparkio/core"

const UiListBox = defineElement(
  {
    tag: "ui-list-box",
    props: {
      selectionMode: { type: String, value: () => "single" },
    },
    styles: css`@unocss-placeholder
:host { @apply block; }`,
  },
  (props) => {
    return `<div role="listbox" aria-multiselectable="${props.selectionMode === "multiple"}" class="flex flex-col py-1"><slot></slot></div>`
  },
)

export default UiListBox
