import type { Meta, StoryObj } from "@storybook/html"
import "./ui-textarea"

const meta: Meta = {
  title: "Components/Forms/Textarea",
  component: "ui-textarea",
  argTypes: {
    variant: { control: "select", options: ["flat", "bordered", "faded", "underlined"] },
    placeholder: { control: "text" },
    rows: { control: "number" },
    isDisabled: { control: "boolean" },
  },
  args: { variant: "flat", placeholder: "Enter text...", rows: 3, isDisabled: false },
}
export default meta
type Story = StoryObj

export const Default: Story = {
  render: (args) => {
    const el = document.createElement("ui-textarea")
    el.setAttribute("variant", args.variant as string)
    el.setAttribute("placeholder", args.placeholder as string)
    el.setAttribute("rows", String(args.rows))
    if (args.isDisabled) el.setAttribute("is-disabled", "")
    el.style.width = "300px"
    return el
  },
}
