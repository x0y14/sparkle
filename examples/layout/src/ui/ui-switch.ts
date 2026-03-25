import { defineElement, css, useProp, useEffect, useHost, useEvent } from "@sparkio/core"
import * as V from "./variants"

const UiSwitch = defineElement(
  {
    tag: "ui-switch",
    props: {
      isSelected: { type: Boolean, value: () => false },
      isDisabled: { type: Boolean, value: () => false },
      color: { type: String, value: () => "primary" },
      size: { type: String, value: () => "md" },
    },
    styles: css`@unocss-placeholder
:host { @apply flex items-center justify-center; width: 100%; height: 100%; }`,
  },
  (props) => {
    const host = useHost()
    const dispatchChange = useEvent<{ selected: boolean }>("change", { bubbles: true, composed: true })
    const [isSelected, setIsSelected] = useProp<boolean>("isSelected")

    useEffect(() => {
      const root = host.current.shadowRoot!
      const btn = root.querySelector("[role='switch']")
      if (!btn || props.isDisabled) return
      const handler = () => {
        const next = !isSelected
        setIsSelected(next)
        dispatchChange({ selected: next })
      }
      btn.addEventListener("click", handler)
      return () => btn.removeEventListener("click", handler)
    }, [isSelected, props.isDisabled])

    const trackSize = V.switchTrackSize[props.size as V.Size] || V.switchTrackSize.md
    const thumbSize = V.switchThumbSize[props.size as V.Size] || V.switchThumbSize.md
    const colorClass = V.dot[props.color as V.Color] || V.dot.primary
    const trackColor = isSelected ? colorClass : "bg-default-200"
    const thumbPos = isSelected ? "translate-x-full" : "translate-x-0.5"
    const disabledClass = props.isDisabled ? "opacity-50 pointer-events-none" : ""

    return `<label class="flex items-center gap-2 cursor-pointer ${disabledClass}">
  <button role="switch" aria-checked="${isSelected}" class="${trackSize} rounded-full transition-colors ${trackColor} relative cursor-pointer">
    <span class="${thumbSize} rounded-full bg-white absolute top-1/2 -translate-y-1/2 transition-transform ${thumbPos} shadow-sm"></span>
  </button>
  <slot></slot>
</label>`
  },
)

export default UiSwitch
