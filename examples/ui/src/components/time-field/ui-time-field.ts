import { defineElement, css, useProp, useEffect, useHost, useEvent } from "@sparkio/core"

const UiTimeField = defineElement(
  {
    tag: "ui-time-field",
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

    const parts = value ? value.split(":") : ["", ""]
    const hour = parts[0] || ""
    const minute = parts[1] || ""

    useEffect(() => {
      const root = host.current.shadowRoot!
      const handleInput = () => {
        const h = (root.querySelector("[data-segment='hour']") as HTMLInputElement)?.value || ""
        const m = (root.querySelector("[data-segment='minute']") as HTMLInputElement)?.value || ""
        if (h && m) {
          const v = `${h.padStart(2, "0")}:${m.padStart(2, "0")}`
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
    <input data-segment="hour" type="text" inputmode="numeric" maxlength="2" placeholder="HH" value="${hour}" class="w-8 bg-transparent outline-none text-center text-sm" aria-label="Hour">
    <span class="text-default-400">:</span>
    <input data-segment="minute" type="text" inputmode="numeric" maxlength="2" placeholder="MM" value="${minute}" class="w-8 bg-transparent outline-none text-center text-sm" aria-label="Minute">
  </div>
</div>`
  },
)

export default UiTimeField
