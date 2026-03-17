import { defineElement, css, useProp, useEffect, useHost, useEvent } from "@sparkio/core"

const UiDateField = defineElement(
  {
    tag: "ui-date-field",
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

    const parts = value ? value.split("-") : ["", "", ""]
    const year = parts[0] || ""
    const month = parts[1] || ""
    const day = parts[2] || ""

    useEffect(() => {
      const root = host.current.shadowRoot!
      const handleInput = () => {
        const y = (root.querySelector("[data-segment='year']") as HTMLInputElement)?.value || ""
        const m = (root.querySelector("[data-segment='month']") as HTMLInputElement)?.value || ""
        const d = (root.querySelector("[data-segment='day']") as HTMLInputElement)?.value || ""
        if (y && m && d) {
          const v = `${y.padStart(4, "0")}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`
          setValue(v)
          dispatchChange({ value: v })
        }
      }
      root.addEventListener("input", handleInput)
      return () => root.removeEventListener("input", handleInput)
    }, [])

    const labelHtml = props.label ? `<label class="text-sm text-default-500 mb-1">${props.label}</label>` : ""

    return `<div class="flex flex-col">
  ${labelHtml}
  <div class="flex items-center gap-1 bg-default-100 rounded-lg px-3 h-10">
    <input data-segment="year" type="text" inputmode="numeric" maxlength="4" placeholder="YYYY" value="${year}" class="w-12 bg-transparent outline-none text-center text-sm" aria-label="Year">
    <span class="text-default-400">/</span>
    <input data-segment="month" type="text" inputmode="numeric" maxlength="2" placeholder="MM" value="${month}" class="w-8 bg-transparent outline-none text-center text-sm" aria-label="Month">
    <span class="text-default-400">/</span>
    <input data-segment="day" type="text" inputmode="numeric" maxlength="2" placeholder="DD" value="${day}" class="w-8 bg-transparent outline-none text-center text-sm" aria-label="Day">
  </div>
</div>`
  },
)

export default UiDateField
