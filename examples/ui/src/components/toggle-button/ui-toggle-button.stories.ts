import type { Meta, StoryObj } from "@storybook/html"
import "./ui-toggle-button"

const meta: Meta = {
  title: "Components/Buttons/ToggleButton",
  component: "ui-toggle-button",
  argTypes: {
    isSelected: { control: "boolean" },
    isDisabled: { control: "boolean" },
    color: { control: "select", options: ["default", "primary", "secondary", "success", "warning", "danger"] },
    size: { control: "select", options: ["sm", "md", "lg"] },
  },
  args: { isSelected: false, isDisabled: false, color: "primary", size: "md" },
}
export default meta
type Story = StoryObj

export const Default: Story = {
  render: (args) => {
    const el = document.createElement("ui-toggle-button")
    if (args.isSelected) el.setAttribute("is-selected", "")
    if (args.isDisabled) el.setAttribute("is-disabled", "")
    el.setAttribute("color", args.color as string)
    el.setAttribute("size", args.size as string)
    el.textContent = "Toggle"
    return el
  },
}
