import { defineElement, css } from "@sparkio/core"
import * as V from "./variants"

const UiProgressBar = defineElement(
  {
    tag: "ui-progress-bar",
    props: {
      value: { type: Number, value: () => 0 },
      maxValue: { type: Number, value: () => 100 },
      color: { type: String, value: () => "primary" },
      size: { type: String, value: () => "md" },
      label: { type: String, value: () => "" },
      isIndeterminate: { type: Boolean, value: () => false },
    },
    styles: css`@unocss-placeholder
:host { @apply flex items-center; width: 100%; height: 100%; }`,
  },
  (props) => {
    const pct = props.maxValue > 0 ? Math.min(100, Math.max(0, (props.value / props.maxValue) * 100)) : 0
    const colorClass = V.dot[props.color as V.Color] || V.dot.primary
    const trackSize = V.progressTrackSize[props.size as V.Size] || V.progressTrackSize.md

    const labelHtml = props.label
      ? `<div class="flex justify-between mb-1"><span data-label class="text-sm font-medium text-foreground">${props.label}</span><span class="text-sm text-default-400">${Math.round(pct)}%</span></div>`
      : ""

    const fillStyle = props.isIndeterminate ? "" : `style="width:${pct}%"`
    const fillClass = props.isIndeterminate
      ? `${colorClass} animate-[indeterminate_1.5s_ease_infinite] w-1/2`
      : `${colorClass}`

    return `${labelHtml}<div role="progressbar" aria-valuenow="${props.value}" aria-valuemin="0" aria-valuemax="${props.maxValue}" ${props.isIndeterminate ? 'aria-valuetext="indeterminate"' : ""}>
  <div data-track class="w-full ${trackSize} bg-default-200 rounded-full overflow-hidden">
    <div data-fill class="${fillClass} h-full rounded-full transition-all" ${fillStyle}></div>
  </div>
</div>`
  },
)

export default UiProgressBar
