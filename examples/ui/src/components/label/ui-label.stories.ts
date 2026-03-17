import type { Meta, StoryObj } from "@storybook/html"
import "./ui-label"

const meta: Meta = { title: "Components/Typography/Label", component: "ui-label" }
export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => {
    const el = document.createElement("ui-label")
    el.textContent = "Email address"
    return el
  },
}
