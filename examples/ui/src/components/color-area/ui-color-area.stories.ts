import type { Meta, StoryObj } from "@storybook/html"
import "./ui-color-area"

const meta: Meta = {
  title: "Components/Color/ColorArea",
  component: "ui-color-area",
  argTypes: {
    xValue: { control: { type: "range", min: 0, max: 100 } },
    yValue: { control: { type: "range", min: 0, max: 100 } },
  },
  args: { xValue: 100, yValue: 100 },
}
export default meta
type Story = StoryObj

export const Default: Story = {
  render: (args) => {
    const el = document.createElement("ui-color-area")
    el.setAttribute("x-value", String(args.xValue))
    el.setAttribute("y-value", String(args.yValue))
    el.style.width = "300px"
    return el
  },
}
