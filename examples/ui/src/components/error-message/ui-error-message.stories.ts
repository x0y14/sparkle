import type { Meta, StoryObj } from "@storybook/html"
import "./ui-error-message"

const meta: Meta = { title: "Components/Typography/ErrorMessage", component: "ui-error-message" }
export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => {
    const el = document.createElement("ui-error-message")
    el.textContent = "This field is required."
    return el
  },
}
