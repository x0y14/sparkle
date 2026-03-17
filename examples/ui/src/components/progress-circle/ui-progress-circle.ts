import { defineElement, css } from "@sparkio/core"
import * as V from "../../utils/variants"

const circleSizeMap: Record<string, string> = { sm: "w-8 h-8", md: "w-12 h-12", lg: "w-16 h-16" }
const R = 40
const CIRCUMFERENCE = 2 * Math.PI * R

const UiProgressCircle = defineElement(
  {
    tag: "ui-progress-circle",
    props: {
      value: { type: Number, value: () => 0 },
      maxValue: { type: Number, value: () => 100 },
      color: { type: String, value: () => "primary" },
      size: { type: String, value: () => "md" },
    },
    styles: css`@unocss-placeholder
:host { @apply inline-flex; }`,
  },
  (props) => {
    const pct = props.maxValue > 0 ? Math.min(100, Math.max(0, (props.value / props.maxValue) * 100)) : 0
    const offset = CIRCUMFERENCE * (1 - pct / 100)
    const sizeClass = circleSizeMap[props.size] || circleSizeMap.md
    const colorClass = V.textColor[props.color as V.Color] || V.textColor.primary

    return `<div role="progressbar" aria-valuenow="${props.value}" aria-valuemin="0" aria-valuemax="${props.maxValue}">
  <svg class="${sizeClass}" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="${R}" stroke="currentColor" stroke-width="8" fill="none" class="text-default-200" opacity="0.25"></circle>
    <circle cx="50" cy="50" r="${R}" stroke="currentColor" stroke-width="8" fill="none" class="${colorClass}" stroke-dasharray="${CIRCUMFERENCE}" stroke-dashoffset="${offset}" stroke-linecap="round" transform="rotate(-90 50 50)"></circle>
  </svg>
</div>`
  },
)

export default UiProgressCircle
