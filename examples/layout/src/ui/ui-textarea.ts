import { defineElement, css, useProp, useEffect, useHost, useEvent } from "@sparkio/core"
import * as V from "./variants"

const UiTextarea = defineElement(
  {
    tag: "ui-textarea",
    props: {
      variant: { type: String, value: () => "flat" },
      size: { type: String, value: () => "md" },
      value: { type: String, reflect: true, value: () => "" },
      placeholder: { type: String, value: () => "" },
      rows: { type: Number, value: () => 3 },
      isDisabled: { type: Boolean, value: () => false },
      isReadOnly: { type: Boolean, value: () => false },
      isInvalid: { type: Boolean, value: () => false },
    },
    styles: css`@unocss-placeholder
:host { @apply block; width: 100%; height: 100%; }`,
  },
  (props) => {
    const [value, setValue] = useProp<string>("value")
    const host = useHost()
    const dispatchInput = useEvent<{ value: string }>("input", { bubbles: true, composed: true })

    useEffect(() => {
      const root = host.current.shadowRoot!
      const ta = root.querySelector("textarea")
      if (!ta) return
      const handler = (e: Event) => {
        const v = (e.target as HTMLTextAreaElement).value
        setValue(v)
        dispatchInput({ value: v })
      }
      ta.addEventListener("input", handler)
      return () => ta.removeEventListener("input", handler)
    }, [])

    const variantClass = V.inputVariant[props.variant] || V.inputVariant.flat
    const invalidClass = props.isInvalid ? "border-danger" : ""
    const disabledClass = props.isDisabled ? "opacity-50 pointer-events-none" : ""

    return `<div class="${variantClass} rounded-lg p-2 transition-colors h-full ${invalidClass} ${disabledClass}">
  <textarea rows="${props.rows}" placeholder="${props.placeholder}" class="w-full h-full bg-transparent outline-none text-foreground placeholder-default-400 text-sm" ${props.isDisabled ? "disabled" : ""} ${props.isReadOnly ? "readonly" : ""} ${props.isInvalid ? 'aria-invalid="true"' : ""}>${value}</textarea>
</div>`
  },
)

export default UiTextarea
