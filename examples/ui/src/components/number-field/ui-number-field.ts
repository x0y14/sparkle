import { defineElement, css, useProp, useEffect, useHost, useEvent } from "@sparkio/core"

const UiNumberField = defineElement(
  {
    tag: "ui-number-field",
    props: {
      value: { type: Number, reflect: true, value: () => 0 },
      minValue: { type: Number, value: () => -Infinity },
      maxValue: { type: Number, value: () => Infinity },
      step: { type: Number, value: () => 1 },
      label: { type: String, value: () => "" },
      isDisabled: { type: Boolean, value: () => false },
    },
    styles: css`@unocss-placeholder
:host { @apply inline-block; }`,
  },
  (props) => {
    const [value, setValue] = useProp<number>("value")
    const host = useHost()
    const dispatchChange = useEvent<{ value: number }>("change", { bubbles: true, composed: true })

    useEffect(() => {
      const root = host.current.shadowRoot!
      const handler = (e: Event) => {
        const btn = (e.target as HTMLElement).closest("button")
        if (!btn || props.isDisabled) return
        const action = btn.dataset.action
        let newVal = value
        if (action === "increment") newVal = Math.min(props.maxValue, value + props.step)
        else if (action === "decrement") newVal = Math.max(props.minValue, value - props.step)
        setValue(newVal)
        dispatchChange({ value: newVal })
      }
      root.addEventListener("click", handler)
      return () => root.removeEventListener("click", handler)
    }, [value, props.step, props.minValue, props.maxValue, props.isDisabled])

    const labelHtml = props.label ? `<label class="text-sm font-medium text-foreground mr-2">${props.label}</label>` : ""
    const disabledAttr = props.isDisabled ? "disabled" : ""

    return `<div class="inline-flex items-center">
  ${labelHtml}
  <div class="inline-flex items-center border-2 border-default-200 rounded-lg">
    <button data-action="decrement" class="px-2 h-10 hover:bg-default-100 rounded-l-lg cursor-pointer" ${disabledAttr}>-</button>
    <input type="text" inputmode="numeric" value="${value}" class="w-16 h-10 text-center bg-transparent outline-none text-foreground" ${disabledAttr}>
    <button data-action="increment" class="px-2 h-10 hover:bg-default-100 rounded-r-lg cursor-pointer" ${disabledAttr}>+</button>
  </div>
</div>`
  },
)

export default UiNumberField
