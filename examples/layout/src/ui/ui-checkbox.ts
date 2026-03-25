import { defineElement, css, useProp, useEffect, useHost, useEvent } from "@sparkio/core"
import * as V from "./variants"

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
:host { @apply flex items-center justify-center; width: 100%; height: 100%; }`,
  },
  (props) => {
    const host = useHost()
    const dispatchChange = useEvent<{ selected: boolean }>("change", { bubbles: true, composed: true })
    const [isSelected, setIsSelected] = useProp<boolean>("isSelected")

    useEffect(() => {
      const root = host.current.shadowRoot!
      const label = root.querySelector("label")
      if (!label || props.isDisabled) return
      const handler = () => {
        const next = !isSelected
        setIsSelected(next)
        dispatchChange({ selected: next })
      }
      label.addEventListener("click", handler)
      return () => label.removeEventListener("click", handler)
    }, [isSelected, props.isDisabled])

    const sizeClass = V.checkboxSize[props.size as V.Size] || V.checkboxSize.md
    const colorClass = V.dot[props.color as V.Color] || V.dot.primary
    const boxClass = isSelected ? `${colorClass} border-transparent` : "border-default-300"
    const disabledClass = props.isDisabled ? "opacity-50 pointer-events-none" : ""

    const icon = isSelected
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
