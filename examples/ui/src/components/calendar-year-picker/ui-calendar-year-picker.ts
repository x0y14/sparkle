import { defineElement, css, useProp, useEffect, useHost, useEvent } from "@sparkio/core"

const UiCalendarYearPicker = defineElement(
  {
    tag: "ui-calendar-year-picker",
    props: {
      value: { type: Number, reflect: true, value: () => new Date().getFullYear() },
      minValue: { type: Number, value: () => 1900 },
      maxValue: { type: Number, value: () => 2100 },
    },
    styles: css`@unocss-placeholder
:host { @apply block; }`,
  },
  (props) => {
    const [value, setValue] = useProp<number>("value")
    const host = useHost()
    const dispatchChange = useEvent<{ value: number }>("change", { bubbles: true, composed: true })

    useEffect(() => {
      const root = host.current.shadowRoot!
      const handleClick = (e: Event) => {
        const target = e.target as HTMLElement
        if (target.matches("[data-year]")) {
          const year = Number(target.getAttribute("data-year"))
          setValue(year)
          dispatchChange({ value: year })
        }
      }
      root.addEventListener("click", handleClick)
      return () => root.removeEventListener("click", handleClick)
    }, [])

    const startYear = Math.max(props.minValue, value - 6)
    const endYear = Math.min(props.maxValue, startYear + 11)

    let cells = ""
    for (let y = startYear; y <= endYear; y++) {
      const isSelected = y === value
      const selectedClass = isSelected ? "bg-primary text-primary-foreground" : "hover:bg-default-100"
      cells += `<button data-year="${y}" class="h-10 rounded-lg flex items-center justify-center text-sm cursor-pointer ${selectedClass}">${y}</button>`
    }

    return `<div class="w-fit p-3">
  <div class="grid grid-cols-4 gap-2" role="grid">
    ${cells}
  </div>
</div>`
  },
)

export default UiCalendarYearPicker
