import type { Meta, StoryObj } from "@storybook/html"
import "./ui-color-slider"

const meta: Meta = {
  title: "Components/Color/ColorSlider",
  component: "ui-color-slider",
  argTypes: {
    channel: { control: "select", options: ["hue", "saturation", "brightness"] },
    value: { control: { type: "range", min: 0, max: 360, step: 1 } },
    orientation: { control: "select", options: ["horizontal", "vertical"] },
  },
  args: { channel: "hue", value: 0, orientation: "horizontal" },
}
export default meta
type Story = StoryObj

export const Default: Story = {
  render: (args) => {
    const el = document.createElement("ui-color-slider")
    el.setAttribute("channel", args.channel as string)
    el.setAttribute("value", String(args.value))
    el.setAttribute("orientation", args.orientation as string)
    el.style.width = "300px"
    return el
  },
}

export const Channels: Story = {
  render: () => {
    const div = document.createElement("div")
    div.style.cssText = "display:flex;flex-direction:column;gap:1rem;width:300px"
    for (const ch of ["hue", "saturation", "brightness"]) {
      const el = document.createElement("ui-color-slider")
      el.setAttribute("channel", ch)
      el.setAttribute("value", "50")
      div.appendChild(el)
    }
    return div
  },
}
