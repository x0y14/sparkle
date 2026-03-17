import { defineElement, css } from "@sparkio/core"
import * as V from "../../utils/variants"

const UiSlider = defineElement(
  {
    tag: "ui-slider",
    props: {
      value: { type: Number, reflect: true, value: () => 0 },
      minValue: { type: Number, value: () => 0 },
      maxValue: { type: Number, value: () => 100 },
      step: { type: Number, value: () => 1 },
      label: { type: String, value: () => "" },
      color: { type: String, value: () => "primary" },
      size: { type: String, value: () => "md" },
      isDisabled: { type: Boolean, value: () => false },
    },
    styles: css`@unocss-placeholder
:host { @apply block; }`,
  },
  (props) => {
    const range = props.maxValue - props.minValue
    const pct = range > 0 ? ((props.value - props.minValue) / range) * 100 : 0
    const colorClass = V.dot[props.color as V.Color] || V.dot.primary
    const trackSize = V.sliderTrackSize[props.size as V.Size] || V.sliderTrackSize.md
    const thumbSize = V.sliderThumbSize[props.size as V.Size] || V.sliderThumbSize.md
    const disabledClass = props.isDisabled ? "opacity-50 pointer-events-none" : ""

    const labelHtml = props.label ? `<div class="flex justify-between mb-2"><span data-label class="text-sm font-medium text-foreground">${props.label}</span><output class="text-sm text-default-400">${props.value}</output></div>` : ""

    return `<div data-container class="${disabledClass}">
  ${labelHtml}
  <div class="relative flex items-center" role="slider" aria-valuenow="${props.value}" aria-valuemin="${props.minValue}" aria-valuemax="${props.maxValue}" tabindex="0">
    <div class="w-full ${trackSize} bg-default-200 rounded-full relative">
      <div class="${colorClass} h-full rounded-full" style="width:${pct}%"></div>
    </div>
    <div class="${thumbSize} ${colorClass} rounded-full border-2 border-white shadow-md absolute" style="left:${pct}%;transform:translateX(-50%)"></div>
  </div>
</div>`
  },
)

export default UiSlider
