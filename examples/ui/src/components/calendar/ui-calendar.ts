import { defineElement, css, useProp, useEffect, useHost, useEvent, useState } from "@sparkio/core"

const UiCalendar = defineElement(
  {
    tag: "ui-calendar",
    props: {
      value: { type: String, reflect: true, value: () => "" },
      minValue: { type: String, value: () => "" },
      maxValue: { type: String, value: () => "" },
    },
    styles: css`@unocss-placeholder
:host { @apply block; }`,
  },
  (props) => {
    const [value, setValue] = useProp<string>("value")
    const host = useHost()
    const dispatchChange = useEvent<{ value: string }>("change", { bubbles: true, composed: true })

    const now = value ? new Date(value + "T00:00:00") : new Date()
    const [viewYear, setViewYear] = useState(now.getFullYear())
    const [viewMonth, setViewMonth] = useState(now.getMonth())

    useEffect(() => {
      const root = host.current.shadowRoot!
      const handleClick = (e: Event) => {
        const target = e.target as HTMLElement
        if (target.matches("[data-prev]")) {
          const m = viewMonth - 1
          if (m < 0) { setViewMonth(11); setViewYear(viewYear - 1) }
          else { setViewMonth(m) }
        } else if (target.matches("[data-next]")) {
          const m = viewMonth + 1
          if (m > 11) { setViewMonth(0); setViewYear(viewYear + 1) }
          else { setViewMonth(m) }
        } else if (target.matches("[data-day]")) {
          const day = target.getAttribute("data-day")!
          setValue(day)
          dispatchChange({ value: day })
        }
      }
      root.addEventListener("click", handleClick)
      return () => root.removeEventListener("click", handleClick)
    }, [viewYear, viewMonth])

    const formatter = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" })
    const monthLabel = formatter.format(new Date(viewYear, viewMonth, 1))

    const firstDay = new Date(viewYear, viewMonth, 1).getDay()
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

    const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]
    const headerCells = dayNames.map((d) => `<div class="text-center text-xs text-default-400 font-medium py-1">${d}</div>`).join("")

    let cells = ""
    for (let i = 0; i < firstDay; i++) {
      cells += `<div></div>`
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
      const isSelected = dateStr === value
      const isDisabled = (props.minValue && dateStr < props.minValue) || (props.maxValue && dateStr > props.maxValue)
      const selectedClass = isSelected ? "bg-primary text-primary-foreground" : "hover:bg-default-100"
      const disabledClass = isDisabled ? "opacity-30 pointer-events-none" : "cursor-pointer"
      cells += `<button data-day="${dateStr}" class="w-8 h-8 rounded-full flex items-center justify-center text-sm ${selectedClass} ${disabledClass}">${d}</button>`
    }

    return `<div class="w-fit p-3">
  <div class="flex items-center justify-between mb-2">
    <button data-prev class="w-8 h-8 rounded-full flex items-center justify-center hover:bg-default-100" aria-label="Previous month">&lt;</button>
    <span class="text-sm font-semibold">${monthLabel}</span>
    <button data-next class="w-8 h-8 rounded-full flex items-center justify-center hover:bg-default-100" aria-label="Next month">&gt;</button>
  </div>
  <div class="grid grid-cols-7 gap-1" role="grid">
    ${headerCells}
    ${cells}
  </div>
</div>`
  },
)

export default UiCalendar
