import type { Meta, StoryObj } from "@storybook/html"
import "./ui-date-field"

const meta: Meta = {
  title: "Components/Date/DateField",
  component: "ui-date-field",
  argTypes: {
    value: { control: "text" },
    label: { control: "text" },
  },
  args: { value: "", label: "Date" },
}
export default meta
type Story = StoryObj

export const Default: Story = {
  render: (args) => {
    const el = document.createElement("ui-date-field")
    if (args.value) el.setAttribute("value", args.value as string)
    if (args.label) el.setAttribute("label", args.label as string)
    el.style.width = "200px"
    return el
  },
}

export const WithValue: Story = {
  render: () => {
    const el = document.createElement("ui-date-field")
    el.setAttribute("value", "2025-01-15")
    el.setAttribute("label", "Birth date")
    el.style.width = "200px"
    return el
  },
}
