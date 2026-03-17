import { defineElement, css, useProp, useEffect, useHost, useEvent, useState } from "@sparkio/core"

const UiComboBox = defineElement(
  {
    tag: "ui-combo-box",
    props: {
      placeholder: { type: String, value: () => "" },
      isDisabled: { type: Boolean, value: () => false },
      selectedKey: { type: String, reflect: true, value: () => "" },
    },
    styles: css`@unocss-placeholder
:host { @apply block; }`,
  },
  (props) => {
    const [selectedKey, setSelectedKey] = useProp<string>("selectedKey")
    const host = useHost()
    const dispatchChange = useEvent<{ key: string }>("change", { bubbles: true, composed: true })
    const [open, setOpen] = useState(false)

    useEffect(() => {
      const root = host.current.shadowRoot!
      const input = root.querySelector("input")
      if (!input) return
      const onFocus = () => setOpen(true)
      const onBlur = () => {
        setTimeout(() => setOpen(false), 150)
      }
      const onInput = () => {
        setOpen(true)
      }
      input.addEventListener("focus", onFocus)
      input.addEventListener("blur", onBlur)
      input.addEventListener("input", onInput)

      const handleClick = (e: Event) => {
        const target = e.target as HTMLElement
        if (target.matches("[data-key]")) {
          const key = target.getAttribute("data-key")!
          setSelectedKey(key)
          dispatchChange({ key })
          setOpen(false)
          input.value = target.textContent || ""
        }
      }
      root.addEventListener("click", handleClick)

      return () => {
        input.removeEventListener("focus", onFocus)
        input.removeEventListener("blur", onBlur)
        input.removeEventListener("input", onInput)
        root.removeEventListener("click", handleClick)
      }
    }, [])

    const disabledClass = props.isDisabled ? "opacity-50 pointer-events-none" : ""

    const popoverHtml = open ? `<div class="absolute z-50 mt-1 w-full bg-content1 rounded-lg shadow-lg border border-default-200 max-h-60 overflow-auto" role="listbox">
      <slot></slot>
    </div>` : ""

    return `<div class="relative ${disabledClass}">
  <div class="flex items-center bg-default-100 rounded-lg px-3 h-10">
    <input type="text" placeholder="${props.placeholder}" class="flex-1 bg-transparent outline-none text-sm text-foreground placeholder-default-400" ${props.isDisabled ? "disabled" : ""} role="combobox" aria-expanded="${open}" aria-autocomplete="list">
    <button class="ml-1 text-default-400" tabindex="-1" aria-label="Toggle">&#9662;</button>
  </div>
  ${popoverHtml}
</div>`
  },
)

export default UiComboBox
