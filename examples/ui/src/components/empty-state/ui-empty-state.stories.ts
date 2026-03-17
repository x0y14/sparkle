import type { Meta, StoryObj } from "@storybook/html"
import "./ui-empty-state"

const meta: Meta = {
  title: "Components/Data Display/EmptyState",
  component: "ui-empty-state",
  argTypes: { title: { control: "text" }, description: { control: "text" } },
  args: { title: "No results found", description: "Try adjusting your search." },
}
export default meta
type Story = StoryObj

export const Default: Story = {
  render: (args) => {
    const el = document.createElement("ui-empty-state")
    el.setAttribute("title", args.title as string)
    el.setAttribute("description", args.description as string)
    return el
  },
}
