import type { Meta, StoryObj } from "@storybook/html"
import "./ui-date-picker"

const meta: Meta = {
  title: "Components/Date/DatePicker",
  component: "ui-date-picker",
  argTypes: {
    value: { control: "text" },
    label: { control: "text" },
  },
  args: { value: "", label: "Select date" },
}
export default meta
type Story = StoryObj

export const Default: Story = {
  render: (args) => {
    const el = document.createElement("ui-date-picker")
    if (args.value) el.setAttribute("value", args.value as string)
    if (args.label) el.setAttribute("label", args.label as string)
    el.style.width = "250px"
    return el
  },
}

export const WithValue: Story = {
  render: () => {
    const el = document.createElement("ui-date-picker")
    el.setAttribute("value", "2025-01-15")
    el.setAttribute("label", "Birth date")
    el.style.width = "250px"
    return el
  },
}
