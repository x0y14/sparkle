import type { Meta, StoryObj } from "@storybook/html"
import "./ui-description"

const meta: Meta = { title: "Components/Typography/Description", component: "ui-description" }
export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => {
    const el = document.createElement("ui-description")
    el.textContent = "This is a helper description text."
    return el
  },
}
