import type { Meta, StoryObj } from "@storybook/html"
import "./ui-alert-dialog"

const meta: Meta = {
  title: "Components/Overlays/AlertDialog",
  component: "ui-alert-dialog",
  argTypes: {
    isOpen: { control: "boolean" },
    title: { control: "text" },
    description: { control: "text" },
    isDismissable: { control: "boolean" },
  },
  args: { isOpen: true, title: "Delete Item", description: "Are you sure you want to delete this item? This action cannot be undone.", isDismissable: false },
}
export default meta
type Story = StoryObj

export const Default: Story = {
  render: (args) => {
    const el = document.createElement("ui-alert-dialog")
    if (args.isOpen) el.setAttribute("is-open", "")
    el.setAttribute("title", args.title as string)
    el.setAttribute("description", args.description as string)
    if (args.isDismissable) el.setAttribute("is-dismissable", "")
    el.innerHTML = `
      <button slot="cancel" style="padding:6px 16px;border:1px solid #e4e4e7;border-radius:8px;cursor:pointer">Cancel</button>
      <button slot="action" style="padding:6px 16px;background:#ef4444;color:white;border:none;border-radius:8px;cursor:pointer">Delete</button>
    `
    return el
  },
}
