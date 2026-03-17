import type { Meta, StoryObj } from "@storybook/html"
import "./ui-table"

const meta: Meta = {
  title: "Components/Data Display/Table",
  component: "ui-table",
  argTypes: {
    selectionMode: { control: "select", options: ["none", "single", "multiple"] },
    color: { control: "select", options: ["default", "primary", "secondary", "success", "warning", "danger"] },
  },
  args: { selectionMode: "none", color: "default" },
}
export default meta
type Story = StoryObj

export const Default: Story = {
  render: (args) => {
    const el = document.createElement("ui-table")
    el.setAttribute("selection-mode", args.selectionMode as string)
    el.setAttribute("color", args.color as string)
    el.setAttribute("aria-label", "Example table")
    el.innerHTML = `<table style="width:100%;border-collapse:collapse"><thead><tr><th style="text-align:left;padding:8px;border-bottom:1px solid #e4e4e7">Name</th><th style="text-align:left;padding:8px;border-bottom:1px solid #e4e4e7">Role</th></tr></thead><tbody><tr><td style="padding:8px">Alice</td><td style="padding:8px">Admin</td></tr><tr><td style="padding:8px">Bob</td><td style="padding:8px">User</td></tr></tbody></table>`
    return el
  },
}
