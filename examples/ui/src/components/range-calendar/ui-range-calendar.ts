import { defineElement, css, useProp, useEffect, useHost, useEvent, useState } from "@sparkio/core"

const UiRangeCalendar = defineElement(
  {
    tag: "ui-range-calendar",
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

    const now = startValue ? new Date(startValue + "T00:00:00") : new Date()
    const [viewYear, setViewYear] = useState(now.getFullYear())
    const [viewMonth, setViewMonth] = useState(now.getMonth())
    const [selecting, setSelecting] = useState(false)

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
          if (!selecting || !startValue) {
            setStartValue(day)
            setEndValue("")
            setSelecting(true)
          } else {
            if (day < startValue) {
              setEndValue(startValue)
              setStartValue(day)
            } else {
              setEndValue(day)
            }
            setSelecting(false)
            const s = day < startValue ? day : startValue
            const en = day < startValue ? startValue : day
            dispatchChange({ start: s, end: en })
          }
        }
      }
      root.addEventListener("click", handleClick)
      return () => root.removeEventListener("click", handleClick)
    }, [viewYear, viewMonth, selecting, startValue])

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
      const isStart = dateStr === startValue
      const isEnd = dateStr === endValue
      const inRange = startValue && endValue && dateStr >= startValue && dateStr <= endValue
      const selectedClass = (isStart || isEnd) ? "bg-primary text-primary-foreground" : inRange ? "bg-primary/20" : "hover:bg-default-100"
      cells += `<button data-day="${dateStr}" class="w-8 h-8 rounded-full flex items-center justify-center text-sm cursor-pointer ${selectedClass}">${d}</button>`
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

export default UiRangeCalendar
