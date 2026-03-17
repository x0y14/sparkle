import type { Meta, StoryObj } from "@storybook/html"
import "./ui-skeleton"

const meta: Meta = {
  title: "Components/Feedback/Skeleton",
  component: "ui-skeleton",
  argTypes: {
    isLoaded: { control: "boolean" },
  },
  args: { isLoaded: false },
}
export default meta
type Story = StoryObj

export const Default: Story = {
  render: (args) => {
    const el = document.createElement("ui-skeleton")
    if (args.isLoaded) el.setAttribute("is-loaded", "")
    el.innerHTML = `<div style="width:200px;height:20px"></div>`
    return el
  },
}

export const Loaded: Story = {
  render: () => {
    const el = document.createElement("ui-skeleton")
    el.setAttribute("is-loaded", "")
    el.innerHTML = `<p>Content is loaded</p>`
    return el
  },
}
