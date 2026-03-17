import type { Meta, StoryObj } from "@storybook/html"
import "./ui-date-range-picker"

const meta: Meta = {
  title: "Components/Date/DateRangePicker",
  component: "ui-date-range-picker",
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
    const el = document.createElement("ui-date-range-picker")
    if (args.startValue) el.setAttribute("start-value", args.startValue as string)
    if (args.endValue) el.setAttribute("end-value", args.endValue as string)
    el.style.width = "350px"
    return el
  },
}

export const WithValues: Story = {
  render: () => {
    const el = document.createElement("ui-date-range-picker")
    el.setAttribute("start-value", "2025-01-10")
    el.setAttribute("end-value", "2025-01-20")
    el.style.width = "350px"
    return el
  },
}
