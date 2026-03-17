import { defineElement, css, useEffect, useHost, useEvent } from "@sparkio/core"
import * as V from "../../utils/variants"

const UiRadio = defineElement(
  {
    tag: "ui-radio",
    props: {
      value: { type: String, value: () => "" },
      isSelected: { type: Boolean, value: () => false },
      color: { type: String, value: () => "primary" },
      size: { type: String, value: () => "md" },
      isDisabled: { type: Boolean, value: () => false },
    },
    styles: css`@unocss-placeholder
:host { @apply inline-flex; }`,
  },
  (props) => {
    const host = useHost()
    const dispatchChange = useEvent<{ value: string }>("change", { bubbles: true, composed: true })

    useEffect(() => {
      const root = host.current.shadowRoot!
      const label = root.querySelector("label")
      if (!label || props.isDisabled) return
      const handler = () => dispatchChange({ value: props.value })
      label.addEventListener("click", handler)
      return () => label.removeEventListener("click", handler)
    }, [props.value, props.isDisabled])

    const sizeClass = V.radioSize[props.size as V.Size] || V.radioSize.md
    const colorClass = V.dot[props.color as V.Color] || V.dot.primary
    const borderClass = props.isSelected ? `border-2 border-current ${V.textColor[props.color as V.Color]}` : "border-2 border-default-300"
    const disabledClass = props.isDisabled ? "opacity-50 pointer-events-none" : ""
    const innerDot = props.isSelected ? `<span class="w-2/3 h-2/3 rounded-full ${colorClass}"></span>` : ""

    return `<label class="flex items-center gap-2 cursor-pointer ${disabledClass}">
  <span data-radio class="inline-flex items-center justify-center rounded-full ${sizeClass} ${borderClass}">${innerDot}</span>
  <slot></slot>
</label>`
  },
)

export default UiRadio
