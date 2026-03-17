import type { Meta, StoryObj } from "@storybook/html"
import "./ui-toolbar"

const meta: Meta = {
  title: "Components/Layout/Toolbar",
  component: "ui-toolbar",
  argTypes: {
    orientation: { control: "select", options: ["horizontal", "vertical"] },
  },
  args: { orientation: "horizontal" },
}
export default meta
type Story = StoryObj

export const Default: Story = {
  render: (args) => {
    const el = document.createElement("ui-toolbar")
    el.setAttribute("orientation", args.orientation as string)
    el.innerHTML = `
      <ui-button size="sm">Bold</ui-button>
      <ui-button size="sm">Italic</ui-button>
      <ui-button size="sm">Underline</ui-button>
    `
    return el
  },
}
