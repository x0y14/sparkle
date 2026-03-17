import { defineElement, css, useProp, useEffect, useHost, useEvent, useState } from "@sparkio/core"

const UiDateRangePicker = defineElement(
  {
    tag: "ui-date-range-picker",
    props: {
      startValue: { type: String, reflect: true, value: () => "" },
      endValue: { type: String, reflect: true, value: () => "" },
    },
    styles: css`@unocss-placeholder
:host { @apply block; }`,
  },
  (props) => {
    const [startValue, setStartValue] = useProp<string>("startValue")
    const [endValue, setEndValue] = useProp<string>("endValue")
    const host = useHost()
    const dispatchChange = useEvent<{ start: string; end: string }>("change", { bubbles: true, composed: true })
    const [open, setOpen] = useState(false)

    useEffect(() => {
      const root = host.current.shadowRoot!
      const handleClick = (e: Event) => {
        const target = e.target as HTMLElement
        if (target.matches("[data-trigger]")) {
          setOpen(!open)
        }
      }
      root.addEventListener("click", handleClick)
      return () => root.removeEventListener("click", handleClick)
    }, [open])

    const startDisplay = startValue || "Start date"
    const endDisplay = endValue || "End date"

    const popoverHtml = open ? `<div class="absolute z-50 mt-1 bg-content1 rounded-lg shadow-lg border border-default-200 p-2">
      <slot name="calendar"></slot>
    </div>` : ""

    return `<div class="flex flex-col relative">
  <div class="flex items-center gap-2 bg-default-100 rounded-lg px-3 h-10">
    <span class="flex-1 text-sm ${startValue ? "text-foreground" : "text-default-400"}">${startDisplay}</span>
    <span class="text-default-400">–</span>
    <span class="flex-1 text-sm ${endValue ? "text-foreground" : "text-default-400"}">${endDisplay}</span>
    <button data-trigger class="ml-2 w-6 h-6 flex items-center justify-center text-default-400 hover:text-foreground" aria-label="Open calendar">&#128197;</button>
  </div>
  ${popoverHtml}
</div>`
  },
)

export default UiDateRangePicker
