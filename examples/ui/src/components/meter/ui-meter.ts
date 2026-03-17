import { defineElement, css } from "@sparkio/core"
import * as V from "../../utils/variants"

const UiMeter = defineElement(
  {
    tag: "ui-meter",
    props: {
      value: { type: Number, value: () => 0 },
      minValue: { type: Number, value: () => 0 },
      maxValue: { type: Number, value: () => 100 },
      color: { type: String, value: () => "primary" },
      label: { type: String, value: () => "" },
    },
    styles: css`@unocss-placeholder
:host { @apply block w-full; }`,
  },
  (props) => {
    const range = props.maxValue - props.minValue
    const pct = range > 0 ? Math.min(100, Math.max(0, ((props.value - props.minValue) / range) * 100)) : 0
    const colorClass = V.dot[props.color as V.Color] || V.dot.primary

    const labelHtml = props.label
      ? `<div class="flex justify-between mb-1"><span data-label class="text-sm font-medium text-foreground">${props.label}</span><span class="text-sm text-default-400">${Math.round(pct)}%</span></div>`
      : ""

    return `${labelHtml}<div role="meter" aria-valuenow="${props.value}" aria-valuemin="${props.minValue}" aria-valuemax="${props.maxValue}">
  <div data-track class="w-full h-3 bg-default-200 rounded-full overflow-hidden">
    <div data-fill class="${colorClass} h-full rounded-full transition-all" style="width:${pct}%"></div>
  </div>
</div>`
  },
)

export default UiMeter
