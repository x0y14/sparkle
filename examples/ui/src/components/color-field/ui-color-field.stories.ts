import type { Meta, StoryObj } from "@storybook/html"
import "./ui-color-field"

const meta: Meta = {
  title: "Components/Color/ColorField",
  component: "ui-color-field",
  argTypes: {
    value: { control: "text" },
    label: { control: "text" },
  },
  args: { value: "#3b82f6", label: "Color" },
}
export default meta
type Story = StoryObj

export const Default: Story = {
  render: (args) => {
    const el = document.createElement("ui-color-field")
    el.setAttribute("value", args.value as string)
    el.setAttribute("label", args.label as string)
    el.style.width = "200px"
    return el
  },
}

export const NoLabel: Story = {
  render: () => {
    const el = document.createElement("ui-color-field")
    el.setAttribute("value", "#ef4444")
    el.style.width = "200px"
    return el
  },
}
