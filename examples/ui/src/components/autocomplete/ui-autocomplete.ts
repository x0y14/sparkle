import { defineElement, css, useProp, useEffect, useHost, useEvent, useState } from "@sparkio/core"

const UiAutocomplete = defineElement(
  {
    tag: "ui-autocomplete",
    props: {
      placeholder: { type: String, value: () => "" },
      isDisabled: { type: Boolean, value: () => false },
    },
    styles: css`@unocss-placeholder
:host { @apply block; }`,
  },
  (props) => {
    const host = useHost()
    const dispatchChange = useEvent<{ value: string }>("change", { bubbles: true, composed: true })
    const dispatchInput = useEvent<{ value: string }>("input", { bubbles: true, composed: true })
    const [open, setOpen] = useState(false)

    useEffect(() => {
      const root = host.current.shadowRoot!
      const input = root.querySelector("input")
      if (!input) return
      const onInput = (e: Event) => {
        const v = (e.target as HTMLInputElement).value
        dispatchInput({ value: v })
        setOpen(v.length > 0)
      }
      const onChange = (e: Event) => {
        dispatchChange({ value: (e.target as HTMLInputElement).value })
      }
      const onFocus = () => {
        const v = input.value
        if (v.length > 0) setOpen(true)
      }
      const onBlur = () => {
        setTimeout(() => setOpen(false), 150)
      }
      input.addEventListener("input", onInput)
      input.addEventListener("change", onChange)
      input.addEventListener("focus", onFocus)
      input.addEventListener("blur", onBlur)
      return () => {
        input.removeEventListener("input", onInput)
        input.removeEventListener("change", onChange)
        input.removeEventListener("focus", onFocus)
        input.removeEventListener("blur", onBlur)
      }
    }, [])

    const disabledClass = props.isDisabled ? "opacity-50 pointer-events-none" : ""

    const popoverHtml = open ? `<div class="absolute z-50 mt-1 w-full bg-content1 rounded-lg shadow-lg border border-default-200 max-h-60 overflow-auto" role="listbox">
      <slot></slot>
    </div>` : ""

    return `<div class="relative ${disabledClass}">
  <div class="flex items-center bg-default-100 rounded-lg px-3 h-10">
    <input type="text" placeholder="${props.placeholder}" class="flex-1 bg-transparent outline-none text-sm text-foreground placeholder-default-400" ${props.isDisabled ? "disabled" : ""} role="combobox" aria-expanded="${open}" aria-autocomplete="list">
  </div>
  ${popoverHtml}
</div>`
  },
)

export default UiAutocomplete
