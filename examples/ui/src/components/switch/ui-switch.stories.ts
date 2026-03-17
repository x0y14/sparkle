import type { Meta, StoryObj } from "@storybook/html"
import "./ui-switch"

const meta: Meta = { title: "Components/Forms/Switch", component: "ui-switch", argTypes: { isSelected: { control: "boolean" }, isDisabled: { control: "boolean" }, color: { control: "select", options: ["primary", "secondary", "success", "warning", "danger"] }, size: { control: "select", options: ["sm", "md", "lg"] } }, args: { isSelected: false, isDisabled: false, color: "primary", size: "md" } }
export default meta
type Story = StoryObj
export const Default: Story = { render: (args) => { const el = document.createElement("ui-switch"); if (args.isSelected) el.setAttribute("is-selected", ""); if (args.isDisabled) el.setAttribute("is-disabled", ""); el.setAttribute("color", args.color as string); el.setAttribute("size", args.size as string); el.textContent = "Enable notifications"; return el } }
export const Colors: Story = { render: () => { const div = document.createElement("div"); div.style.cssText = "display:flex;flex-direction:column;gap:0.5rem"; for (const c of ["primary", "secondary", "success", "warning", "danger"]) { const el = document.createElement("ui-switch"); el.setAttribute("is-selected", ""); el.setAttribute("color", c); el.textContent = c; div.appendChild(el) } return div } }
