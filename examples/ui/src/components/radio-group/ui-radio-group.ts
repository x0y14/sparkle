import { defineElement, css } from "@sparkio/core"

const UiRadioGroup = defineElement(
  {
    tag: "ui-radio-group",
    props: {
      value: { type: String, value: () => "" },
      orientation: { type: String, value: () => "vertical" },
      label: { type: String, value: () => "" },
      isDisabled: { type: Boolean, value: () => false },
    },
    styles: css`@unocss-placeholder
:host { @apply block; }`,
  },
  (props) => {
    const dir = props.orientation === "horizontal" ? "flex-row" : "flex-col"
    const legend = props.label ? `<legend class="text-sm font-medium text-foreground mb-2">${props.label}</legend>` : ""
    return `<fieldset role="radiogroup" class="flex ${dir} gap-2" ${props.isDisabled ? "disabled" : ""}>${legend}<slot></slot></fieldset>`
  },
)

export default UiRadioGroup
