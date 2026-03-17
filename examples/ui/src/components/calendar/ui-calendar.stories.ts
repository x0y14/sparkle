import type { Meta, StoryObj } from "@storybook/html"
import "./ui-calendar"

const meta: Meta = {
  title: "Components/Date/Calendar",
  component: "ui-calendar",
  argTypes: {
    value: { control: "text" },
    minValue: { control: "text" },
    maxValue: { control: "text" },
  },
  args: { value: "", minValue: "", maxValue: "" },
}
export default meta
type Story = StoryObj

export const Default: Story = {
  render: (args) => {
    const el = document.createElement("ui-calendar")
    if (args.value) el.setAttribute("value", args.value as string)
    if (args.minValue) el.setAttribute("min-value", args.minValue as string)
    if (args.maxValue) el.setAttribute("max-value", args.maxValue as string)
    return el
  },
}

export const WithValue: Story = {
  render: () => {
    const el = document.createElement("ui-calendar")
    el.setAttribute("value", "2025-01-15")
    return el
  },
}

export const WithMinMax: Story = {
  render: () => {
    const el = document.createElement("ui-calendar")
    el.setAttribute("min-value", "2025-01-05")
    el.setAttribute("max-value", "2025-01-25")
    return el
  },
}
