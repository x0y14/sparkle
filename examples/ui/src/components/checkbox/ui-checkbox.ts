import { defineElement, css, useEffect, useHost, useEvent } from "@sparkio/core"
import * as V from "../../utils/variants"

const UiCheckbox = defineElement(
  {
    tag: "ui-checkbox",
    props: {
      isSelected: { type: Boolean, value: () => false },
      isDisabled: { type: Boolean, value: () => false },
      isIndeterminate: { type: Boolean, value: () => false },
      color: { type: String, value: () => "primary" },
      size: { type: String, value: () => "md" },
      value: { type: String, value: () => "" },
    },
    styles: css`@unocss-placeholder
:host { @apply inline-flex; }`,
  },
  (props) => {
    const host = useHost()
    const dispatchChange = useEvent<{ selected: boolean }>("change", { bubbles: true, composed: true })

    useEffect(() => {
      const root = host.current.shadowRoot!
      const label = root.querySelector("label")
      if (!label || props.isDisabled) return
      const handler = () => dispatchChange({ selected: !props.isSelected })
      label.addEventListener("click", handler)
      return () => label.removeEventListener("click", handler)
    }, [props.isSelected, props.isDisabled])

    const sizeClass = V.checkboxSize[props.size as V.Size] || V.checkboxSize.md
    const colorClass = V.dot[props.color as V.Color] || V.dot.primary
    const boxClass = props.isSelected ? `${colorClass} border-transparent` : "border-default-300"
    const disabledClass = props.isDisabled ? "opacity-50 pointer-events-none" : ""

    const icon = props.isSelected
      ? `<svg class="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6L9 17l-5-5"></path></svg>`
      : props.isIndeterminate
        ? `<svg class="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12h14"></path></svg>`
        : ""

    return `<label class="flex items-center gap-2 cursor-pointer ${disabledClass}">
  <span data-check class="inline-flex items-center justify-center border-2 rounded-md transition-colors ${sizeClass} ${boxClass}">${icon}</span>
  <slot></slot>
</label>`
  },
)

export default UiCheckbox
