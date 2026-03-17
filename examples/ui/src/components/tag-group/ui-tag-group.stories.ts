import type { Meta, StoryObj } from "@storybook/html"
import "./ui-tag-group"

const meta: Meta = {
  title: "Components/Data Display/TagGroup",
  component: "ui-tag-group",
  argTypes: {
    label: { control: "text" },
    selectionMode: { control: "select", options: ["none", "single", "multiple"] },
  },
  args: { label: "Categories", selectionMode: "none" },
}
export default meta
type Story = StoryObj

export const Default: Story = {
  render: (args) => {
    const el = document.createElement("ui-tag-group")
    if (args.label) el.setAttribute("label", args.label as string)
    el.setAttribute("selection-mode", args.selectionMode as string)
    el.innerHTML = `
      <ui-tag color="primary">Tag 1</ui-tag>
      <ui-tag color="secondary">Tag 2</ui-tag>
      <ui-tag color="success">Tag 3</ui-tag>
    `
    return el
  },
}
