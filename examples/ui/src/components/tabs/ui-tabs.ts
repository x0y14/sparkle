import { defineElement, css } from "@sparkio/core"

const UiTabs = defineElement(
  {
    tag: "ui-tabs",
    props: {
      selectedKey: { type: String, value: () => "" },
      variant: { type: String, value: () => "solid" },
      color: { type: String, value: () => "primary" },
      size: { type: String, value: () => "md" },
      radius: { type: String, value: () => "md" },
      isDisabled: { type: Boolean, value: () => false },
    },
    styles: css`@unocss-placeholder
:host { @apply block; }`,
  },
  () => {
    return `<div>
  <div role="tablist" class="flex items-center gap-0 bg-default-100 rounded-lg p-1"><slot name="tab"></slot></div>
  <div class="mt-2"><slot></slot></div>
</div>`
  },
)

export default UiTabs
