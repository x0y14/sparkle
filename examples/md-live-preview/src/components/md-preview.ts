import { defineElement, css } from "@sparkio/core"

const MdPreview = defineElement(
  {
    tag: "md-preview",
    props: {
      content: { type: String, value: () => "" },
    },
    styles: css`@unocss-placeholder
:host { @apply block; }`,
  },
  (props) => {
    if (!props.content) {
      return `<div class="p-6 prose prose-sm max-w-none"><p class="text-gray-400 italic">Preview will appear here</p></div>`
    }
    return `<div class="p-6 prose prose-sm max-w-none">${props.content}</div>`
  },
)

export default MdPreview
