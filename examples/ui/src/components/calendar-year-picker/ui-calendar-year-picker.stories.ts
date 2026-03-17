import type { Meta, StoryObj } from "@storybook/html"
import "./ui-calendar-year-picker"

const meta: Meta = {
  title: "Components/Date/CalendarYearPicker",
  component: "ui-calendar-year-picker",
  argTypes: {
    value: { control: "number" },
    minValue: { control: "number" },
    maxValue: { control: "number" },
  },
  args: { value: 2025, minValue: 1900, maxValue: 2100 },
}
export default meta
type Story = StoryObj

export const Default: Story = {
  render: (args) => {
    const el = document.createElement("ui-calendar-year-picker")
    el.setAttribute("value", String(args.value))
    el.setAttribute("min-value", String(args.minValue))
    el.setAttribute("max-value", String(args.maxValue))
    return el
  },
}
