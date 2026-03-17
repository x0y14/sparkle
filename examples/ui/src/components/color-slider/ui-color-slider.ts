import { defineElement, css, useEffect, useHost, useEvent } from "@sparkio/core"

const UiColorSlider = defineElement(
  {
    tag: "ui-color-slider",
    props: {
      channel: { type: String, value: () => "hue" },
      value: { type: Number, value: () => 0 },
      orientation: { type: String, value: () => "horizontal" },
    },
    styles: css`@unocss-placeholder
:host { @apply block; }`,
  },
  (props) => {
    const host = useHost()
    const dispatchChange = useEvent<{ value: number }>("change", { bubbles: true, composed: true })

    useEffect(() => {
      const root = host.current.shadowRoot!
      const track = root.querySelector("[role='slider']") as HTMLElement
      if (!track) return

      const handler = (e: PointerEvent) => {
        const rect = track.getBoundingClientRect()
        let ratio: number
        if (props.orientation === "vertical") {
          ratio = 1 - (e.clientY - rect.top) / rect.height
        } else {
          ratio = (e.clientX - rect.left) / rect.width
        }
        ratio = Math.max(0, Math.min(1, ratio))
        const max = props.channel === "hue" ? 360 : 100
        dispatchChange({ value: Math.round(ratio * max) })
      }

      track.addEventListener("pointerdown", handler)
      return () => track.removeEventListener("pointerdown", handler)
    }, [props.channel, props.orientation])

    const isVertical = props.orientation === "vertical"
    const trackClass = isVertical ? "w-4 h-48" : "h-4 w-full"
    const max = props.channel === "hue" ? 360 : 100
    const percent = (props.value / max) * 100

    let gradient: string
    if (props.channel === "hue") {
      gradient = "linear-gradient(to right, red, yellow, lime, cyan, blue, magenta, red)"
    } else if (props.channel === "saturation") {
      gradient = "linear-gradient(to right, #ccc, hsl(0, 100%, 50%))"
    } else {
      gradient = "linear-gradient(to right, #000, #fff)"
    }

    const thumbPos = isVertical
      ? `left:50%;top:${100 - percent}%;transform:translate(-50%,-50%)`
      : `top:50%;left:${percent}%;transform:translate(-50%,-50%)`

    return `<div role="slider" aria-valuenow="${props.value}" aria-valuemin="0" aria-valuemax="${max}" aria-orientation="${props.orientation}" class="relative rounded-full cursor-pointer ${trackClass}" style="background: ${gradient}">
  <div class="absolute w-4 h-4 rounded-full bg-white border-2 border-default-400 shadow-sm" style="${thumbPos}"></div>
</div>`
  },
)

export default UiColorSlider
