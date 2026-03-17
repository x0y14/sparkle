import type { Meta, StoryObj } from "@storybook/html"
import "./ui-separator"

const meta: Meta = {
  title: "Components/Layout/Separator",
  component: "ui-separator",
  argTypes: {
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"],
    },
  },
  args: {
    orientation: "horizontal",
  },
}
export default meta
type Story = StoryObj

export const Default: Story = {
  render: (args) => {
    const el = document.createElement("ui-separator")
    if (args.orientation) el.setAttribute("orientation", args.orientation as string)
    el.style.width = "300px"
    return el
  },
}

export const Horizontal: Story = {
  render: () => {
    const el = document.createElement("ui-separator")
    el.style.width = "300px"
    return el
  },
}

export const Vertical: Story = {
  render: () => {
    const el = document.createElement("ui-separator")
    el.setAttribute("orientation", "vertical")
    el.style.height = "100px"
    return el
  },
}
