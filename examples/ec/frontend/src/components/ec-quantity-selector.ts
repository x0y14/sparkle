import { defineElement, useProp, useEvent, useHost, useEffect, css } from "@blask/core"

const QuantitySelector = defineElement(
  {
    tag: "ec-quantity-selector",
    props: {
      value: { type: Number, reflect: true, value: () => 1 },
      min: { type: Number, value: () => 1 },
      max: { type: Number, value: () => 99 },
    },
    styles: css`@unocss-placeholder
:host { @apply inline-flex; }`,
  },
  (props) => {
    const [value, setValue] = useProp<number>("value")
    const dispatch = useEvent<number>("quantity-change", { bubbles: true, composed: true })
    const host = useHost()

    useEffect(() => {
      const root = host.current.shadowRoot!
      const handler = (e: Event) => {
        const target = (e.target as HTMLElement).closest("[data-action]")
        if (!target) return
        const action = target.getAttribute("data-action")
        let next = value
        if (action === "decrement" && value > props.min) next = value - 1
        if (action === "increment" && value < props.max) next = value + 1
        if (next !== value) {
          setValue(next)
          dispatch(next)
        }
      }
      root.addEventListener("click", handler)
      return () => root.removeEventListener("click", handler)
    }, [value, props.min, props.max])

    return `
      <div class="flex items-center border border-border rounded-none">
        <button data-action="decrement" class="w-10 h-10 flex items-center justify-center text-ink-muted hover:text-ink hover:bg-surface-warm transition-colors text-sm disabled:opacity-30 cursor-pointer border-none bg-transparent disabled:cursor-not-allowed" ${value <= props.min ? "disabled" : ""}>−</button>
        <span class="w-10 h-10 flex items-center justify-center text-sm font-sans font-500 text-ink border-l border-r border-border tabular-nums" data-testid="value">${value}</span>
        <button data-action="increment" class="w-10 h-10 flex items-center justify-center text-ink-muted hover:text-ink hover:bg-surface-warm transition-colors text-sm disabled:opacity-30 cursor-pointer border-none bg-transparent disabled:cursor-not-allowed" ${value >= props.max ? "disabled" : ""}>+</button>
      </div>`
  },
)
export default QuantitySelector
