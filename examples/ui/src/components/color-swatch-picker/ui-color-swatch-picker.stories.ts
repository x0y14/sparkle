import type { Meta, StoryObj } from "@storybook/html"
import "./ui-color-swatch-picker"
import "../color-swatch/ui-color-swatch"

const meta: Meta = {
  title: "Components/Color/ColorSwatchPicker",
  component: "ui-color-swatch-picker",
}
export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => {
    const el = document.createElement("ui-color-swatch-picker")
    for (const c of ["#ef4444", "#f59e0b", "#22c55e", "#3b82f6", "#8b5cf6"]) {
      const swatch = document.createElement("ui-color-swatch")
      swatch.setAttribute("color", c)
      el.appendChild(swatch)
    }
    return el
  },
}
