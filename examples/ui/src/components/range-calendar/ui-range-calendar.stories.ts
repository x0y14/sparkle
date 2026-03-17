import type { Meta, StoryObj } from "@storybook/html"
import "./ui-range-calendar"

const meta: Meta = {
  title: "Components/Date/RangeCalendar",
  component: "ui-range-calendar",
  argTypes: {
    startValue: { control: "text" },
    endValue: { control: "text" },
  },
  args: { startValue: "", endValue: "" },
}
export default meta
type Story = StoryObj

export const Default: Story = {
  render: (args) => {
    const el = document.createElement("ui-range-calendar")
    if (args.startValue) el.setAttribute("start-value", args.startValue as string)
    if (args.endValue) el.setAttribute("end-value", args.endValue as string)
    return el
  },
}

export const WithRange: Story = {
  render: () => {
    const el = document.createElement("ui-range-calendar")
    el.setAttribute("start-value", "2025-01-10")
    el.setAttribute("end-value", "2025-01-20")
    return el
  },
}
