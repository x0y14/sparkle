import type { Meta, StoryObj } from "@storybook/html"
import "./ui-color-picker"

const meta: Meta = {
  title: "Components/Color/ColorPicker",
  component: "ui-color-picker",
}
export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => {
    const el = document.createElement("ui-color-picker")
    return el
  },
}
