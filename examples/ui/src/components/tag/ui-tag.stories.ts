import type { Meta, StoryObj } from "@storybook/html"
import "./ui-tag"

const meta: Meta = {
  title: "Components/Data Display/Tag",
  component: "ui-tag",
  argTypes: {
    color: { control: "select", options: ["default", "primary", "secondary", "success", "warning", "danger"] },
    size: { control: "select", options: ["sm", "md", "lg"] },
    variant: { control: "select", options: ["solid", "flat", "bordered", "light"] },
    isCloseable: { control: "boolean" },
  },
  args: { color: "default", size: "md", variant: "solid", isCloseable: false },
}
export default meta
type Story = StoryObj

export const Default: Story = {
  render: (args) => {
    const el = document.createElement("ui-tag")
    el.setAttribute("color", args.color as string)
    el.setAttribute("size", args.size as string)
    el.setAttribute("variant", args.variant as string)
    if (args.isCloseable) el.setAttribute("is-closeable", "")
    el.textContent = "Tag"
    return el
  },
}

export const Closeable: Story = {
  render: () => {
    const el = document.createElement("ui-tag")
    el.setAttribute("is-closeable", "")
    el.setAttribute("color", "primary")
    el.textContent = "Removable"
    el.addEventListener("remove", () => el.remove())
    return el
  },
}
