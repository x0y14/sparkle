import type { Meta, StoryObj } from "@storybook/html"
import "./ui-time-field"

const meta: Meta = {
  title: "Components/Date/TimeField",
  component: "ui-time-field",
  argTypes: {
    value: { control: "text" },
    label: { control: "text" },
  },
  args: { value: "", label: "Time" },
}
export default meta
type Story = StoryObj

export const Default: Story = {
  render: (args) => {
    const el = document.createElement("ui-time-field")
    if (args.value) el.setAttribute("value", args.value as string)
    if (args.label) el.setAttribute("label", args.label as string)
    el.style.width = "150px"
    return el
  },
}

export const WithValue: Story = {
  render: () => {
    const el = document.createElement("ui-time-field")
    el.setAttribute("value", "14:30")
    el.setAttribute("label", "Start time")
    el.style.width = "150px"
    return el
  },
}
