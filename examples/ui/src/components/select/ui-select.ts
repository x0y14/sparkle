import { defineElement, css, useState, useEffect, useHost, useEvent } from "@sparkio/core"

const UiSelect = defineElement(
  {
    tag: "ui-select",
    props: {
      placeholder: { type: String, value: () => "Select..." },
      isDisabled: { type: Boolean, value: () => false },
      selectedKey: { type: String, value: () => "" },
    },
    styles: css`@unocss-placeholder
:host { @apply block; }`,
  },
  (props) => {
    const [isOpen, setIsOpen] = useState(false)
    const host = useHost()
    const dispatchChange = useEvent<{ key: string }>("change", { bubbles: true, composed: true })

    useEffect(() => {
      const root = host.current.shadowRoot!
      const trigger = root.querySelector("[data-trigger]")
      const listbox = root.querySelector("[data-listbox]")
      if (!trigger) return
      const onTrigger = () => { if (!props.isDisabled) setIsOpen(!isOpen) }
      const onOption = (e: Event) => {
        const opt = (e.target as HTMLElement).closest("[data-key]")
        if (opt) { dispatchChange({ key: opt.getAttribute("data-key")! }); setIsOpen(false) }
      }
      trigger.addEventListener("click", onTrigger)
      if (listbox) listbox.addEventListener("click", onOption)
      return () => { trigger.removeEventListener("click", onTrigger); if (listbox) listbox.removeEventListener("click", onOption) }
    }, [isOpen, props.isDisabled])

    const display = props.selectedKey || props.placeholder

    return `<div class="relative">
  <button data-trigger class="flex items-center justify-between w-full h-10 px-3 bg-default-100 rounded-lg text-sm text-foreground hover:bg-default-200 transition-colors ${props.isDisabled ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}" ${props.isDisabled ? "disabled" : ""}>
    <span>${display}</span>
    <svg class="w-4 h-4 text-default-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"></path></svg>
  </button>
  ${isOpen ? '<div data-listbox class="absolute z-50 mt-1 w-full bg-content1 border border-default-200 rounded-lg shadow-lg py-1 max-h-60 overflow-auto"><slot></slot></div>' : ''}
</div>`
  },
)

export default UiSelect
