import { defineElement, css, useEffect, useHost, useEvent } from "@sparkio/core"

const UiColorArea = defineElement(
  {
    tag: "ui-color-area",
    props: {
      xChannel: { type: String, value: () => "saturation" },
      yChannel: { type: String, value: () => "brightness" },
      xValue: { type: Number, value: () => 100 },
      yValue: { type: Number, value: () => 100 },
    },
    styles: css`@unocss-placeholder
:host { @apply block; }`,
  },
  (props) => {
    const host = useHost()
    const dispatchChange = useEvent<{ x: number; y: number }>("change", { bubbles: true, composed: true })

    useEffect(() => {
      const root = host.current.shadowRoot!
      const area = root.querySelector("[role='slider']") as HTMLElement
      if (!area) return

      const handler = (e: PointerEvent) => {
        const rect = area.getBoundingClientRect()
        const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
        const y = Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / rect.height))
        dispatchChange({ x: Math.round(x * 100), y: Math.round(y * 100) })
      }

      area.addEventListener("pointerdown", handler)
      return () => area.removeEventListener("pointerdown", handler)
    }, [])

    const xPercent = props.xValue
    const yPercent = 100 - props.yValue

    return `<div role="slider" aria-label="${props.xChannel} and ${props.yChannel}" class="relative w-full h-48 rounded-lg cursor-pointer" style="background: linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(0, 100%, 50%))">
  <div class="absolute w-4 h-4 rounded-full border-2 border-white shadow-md" style="left:${xPercent}%;top:${yPercent}%;transform:translate(-50%,-50%)"></div>
</div>`
  },
)

export default UiColorArea
