import { defineElement, css, useProp, useEffect, useHost, useEvent } from "@sparkio/core"
import * as V from "./variants"

const UiInput = defineElement(
  {
    tag: "ui-input",
    props: {
      variant: { type: String, value: () => "flat" },
      size: { type: String, value: () => "md" },
      color: { type: String, value: () => "default" },
      type: { type: String, value: () => "text" },
      value: { type: String, reflect: true, value: () => "" },
      placeholder: { type: String, value: () => "" },
      label: { type: String, value: () => "" },
      isDisabled: { type: Boolean, value: () => false },
      isReadOnly: { type: Boolean, value: () => false },
      isRequired: { type: Boolean, value: () => false },
      isInvalid: { type: Boolean, value: () => false },
    },
    styles: css`@unocss-placeholder
:host { @apply block; width: 100%; height: 100%; }`,
  },
  (props) => {
    const [value, setValue] = useProp<string>("value")
    const host = useHost()
    const dispatchInput = useEvent<{ value: string }>("input", { bubbles: true, composed: true })
    const dispatchChange = useEvent<{ value: string }>("change", { bubbles: true, composed: true })

    useEffect(() => {
      const root = host.current.shadowRoot!
      const input = root.querySelector("input")
      if (!input) return
      const onInput = (e: Event) => {
        const v = (e.target as HTMLInputElement).value
        setValue(v)
        dispatchInput({ value: v })
      }
      const onChange = (e: Event) => {
        dispatchChange({ value: (e.target as HTMLInputElement).value })
      }
      input.addEventListener("input", onInput)
      input.addEventListener("change", onChange)
      return () => {
        input.removeEventListener("input", onInput)
        input.removeEventListener("change", onChange)
      }
    }, [])

    const variantClass = V.inputVariant[props.variant] || V.inputVariant.flat
    const sizeClass = V.inputSizeFit[props.size as V.Size] || V.inputSizeFit.md
    const invalidClass = props.isInvalid ? "border-danger focus-within:border-danger" : ""
    const disabledClass = props.isDisabled ? "opacity-50 pointer-events-none" : ""

    const labelHtml = props.label ? `<label class="sr-only">${props.label}</label>` : ""

    return `<div class="flex items-center h-full ${variantClass} ${sizeClass} rounded-lg transition-colors ${invalidClass} ${disabledClass}">
  <slot name="start-content"></slot>
  ${labelHtml}
  <input type="${props.type}" value="${value}" placeholder="${props.placeholder}" class="flex-1 bg-transparent outline-none text-foreground placeholder-default-400 w-full" ${props.isDisabled ? "disabled" : ""} ${props.isReadOnly ? "readonly" : ""} ${props.isRequired ? 'required aria-required="true"' : ""} ${props.isInvalid ? 'aria-invalid="true"' : ""}>
  <slot name="end-content"></slot>
</div>`
  },
)

export default UiInput
