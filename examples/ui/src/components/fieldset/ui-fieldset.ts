import { defineElement, css } from "@sparkio/core"

const UiFieldset = defineElement(
  {
    tag: "ui-fieldset",
    props: {
      legend: { type: String, value: () => "" },
      isDisabled: { type: Boolean, value: () => false },
    },
    styles: css`@unocss-placeholder
:host { @apply block; }`,
  },
  (props) => {
    const legendHtml = props.legend
      ? `<legend class="text-sm font-medium text-default-700 mb-2">${props.legend}</legend>`
      : ""

    return `<fieldset class="border border-default-200 rounded-lg p-4" ${props.isDisabled ? "disabled" : ""}>${legendHtml}<slot></slot></fieldset>`
  },
)

export default UiFieldset
