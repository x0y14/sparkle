import type { Meta, StoryObj } from "@storybook/html"
import "./ui-radio"

const meta: Meta = { title: "Components/Forms/Radio", component: "ui-radio", argTypes: { isSelected: { control: "boolean" }, color: { control: "select", options: ["primary", "secondary", "success", "warning", "danger"] } }, args: { isSelected: false, color: "primary" } }
export default meta
type Story = StoryObj
export const Default: Story = { render: (args) => { const el = document.createElement("ui-radio"); if (args.isSelected) el.setAttribute("is-selected", ""); el.setAttribute("color", args.color as string); el.textContent = "Option"; return el } }
