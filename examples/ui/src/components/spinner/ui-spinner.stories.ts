import type { Meta, StoryObj } from "@storybook/html"
import "./ui-spinner"

const meta: Meta = {
  title: "Components/Feedback/Spinner",
  component: "ui-spinner",
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
    color: { control: "select", options: ["default", "primary", "secondary", "success", "warning", "danger"] },
    label: { control: "text" },
  },
  args: { size: "md", color: "primary", label: "" },
}
export default meta
type Story = StoryObj

export const Default: Story = {
  render: (args) => {
    const el = document.createElement("ui-spinner")
    if (args.size) el.setAttribute("size", args.size as string)
    if (args.color) el.setAttribute("color", args.color as string)
    if (args.label) el.setAttribute("label", args.label as string)
    return el
  },
}

export const Sizes: Story = {
  render: () => {
    const div = document.createElement("div")
    div.style.display = "flex"
    div.style.alignItems = "center"
    div.style.gap = "1rem"
    for (const size of ["sm", "md", "lg"]) {
      const el = document.createElement("ui-spinner")
      el.setAttribute("size", size)
      div.appendChild(el)
    }
    return div
  },
}

export const Colors: Story = {
  render: () => {
    const div = document.createElement("div")
    div.style.display = "flex"
    div.style.alignItems = "center"
    div.style.gap = "1rem"
    for (const color of ["default", "primary", "secondary", "success", "warning", "danger"]) {
      const el = document.createElement("ui-spinner")
      el.setAttribute("color", color)
      div.appendChild(el)
    }
    return div
  },
}
