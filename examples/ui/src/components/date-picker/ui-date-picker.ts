import { defineElement, css, useProp, useEffect, useHost, useEvent, useState } from "@sparkio/core"

const UiDatePicker = defineElement(
  {
    tag: "ui-date-picker",
    props: {
      value: { type: String, reflect: true, value: () => "" },
      label: { type: String, value: () => "" },
    },
    styles: css`@unocss-placeholder
:host { @apply block; }`,
  },
  (props) => {
    const [value, setValue] = useProp<string>("value")
    const host = useHost()
    const dispatchChange = useEvent<{ value: string }>("change", { bubbles: true, composed: true })
    const [open, setOpen] = useState(false)

    useEffect(() => {
      const root = host.current.shadowRoot!
      const handleClick = (e: Event) => {
        const target = e.target as HTMLElement
        if (target.matches("[data-trigger]")) {
          setOpen(!open)
        } else if (target.matches("[data-day]")) {
          const day = target.getAttribute("data-day")!
          setValue(day)
          dispatchChange({ value: day })
          setOpen(false)
        }
      }
      root.addEventListener("click", handleClick)
      return () => root.removeEventListener("click", handleClick)
    }, [open])

    const labelHtml = props.label ? `<label class="text-sm text-default-500 mb-1">${props.label}</label>` : ""
    const displayValue = value || "YYYY-MM-DD"

    const popoverHtml = open ? `<div class="absolute z-50 mt-1 bg-content1 rounded-lg shadow-lg border border-default-200 p-2">
      <slot name="calendar"></slot>
    </div>` : ""

    return `<div class="flex flex-col relative">
  ${labelHtml}
  <div class="flex items-center bg-default-100 rounded-lg px-3 h-10">
    <span class="flex-1 text-sm ${value ? "text-foreground" : "text-default-400"}">${displayValue}</span>
    <button data-trigger class="ml-2 w-6 h-6 flex items-center justify-center text-default-400 hover:text-foreground" aria-label="Open calendar">&#128197;</button>
  </div>
  ${popoverHtml}
</div>`
  },
)

export default UiDatePicker
