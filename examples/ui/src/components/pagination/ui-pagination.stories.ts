import type { Meta, StoryObj } from "@storybook/html"
import "./ui-pagination"

const meta: Meta = {
  title: "Components/Navigation/Pagination",
  component: "ui-pagination",
  argTypes: {
    total: { control: "number" },
    page: { control: "number" },
    color: { control: "select", options: ["primary", "secondary", "success", "warning", "danger"] },
    size: { control: "select", options: ["sm", "md", "lg"] },
    isDisabled: { control: "boolean" },
  },
  args: { total: 5, page: 1, color: "primary", size: "md", isDisabled: false },
}
export default meta
type Story = StoryObj

export const Default: Story = {
  render: (args) => {
    const el = document.createElement("ui-pagination")
    el.setAttribute("total", String(args.total))
    el.setAttribute("page", String(args.page))
    el.setAttribute("color", args.color as string)
    el.setAttribute("size", args.size as string)
    if (args.isDisabled) el.setAttribute("is-disabled", "")
    return el
  },
}
