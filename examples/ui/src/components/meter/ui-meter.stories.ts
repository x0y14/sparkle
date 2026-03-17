import type { Meta, StoryObj } from "@storybook/html"
import "./ui-meter"

const meta: Meta = {
  title: "Components/Feedback/Meter",
  component: "ui-meter",
  argTypes: {
    value: { control: { type: "range", min: 0, max: 100 } },
    color: { control: "select", options: ["default", "primary", "secondary", "success", "warning", "danger"] },
    label: { control: "text" },
  },
  args: { value: 60, color: "primary", label: "" },
}
export default meta
type Story = StoryObj

export const Default: Story = {
  render: (args) => {
    const el = document.createElement("ui-meter")
    el.setAttribute("value", String(args.value))
    el.setAttribute("color", args.color as string)
    if (args.label) el.setAttribute("label", args.label as string)
    el.style.width = "300px"
    return el
  },
}

export const WithLabel: Story = {
  render: () => {
    const el = document.createElement("ui-meter")
    el.setAttribute("value", "75")
    el.setAttribute("label", "Storage used")
    el.style.width = "300px"
    return el
  },
}
