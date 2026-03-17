import type { Meta, StoryObj } from "@storybook/html"
import "./ui-field-error"

const meta: Meta = { title: "Components/Typography/FieldError", component: "ui-field-error" }
export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => {
    const el = document.createElement("ui-field-error")
    el.textContent = "Please enter a valid email address."
    return el
  },
}
