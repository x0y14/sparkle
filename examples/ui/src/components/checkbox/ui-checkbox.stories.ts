import type { Meta, StoryObj } from "@storybook/html"
import "./ui-checkbox"

const meta: Meta = {
  title: "Components/Forms/Checkbox",
  component: "ui-checkbox",
  argTypes: { isSelected: { control: "boolean" }, isDisabled: { control: "boolean" }, color: { control: "select", options: ["default", "primary", "secondary", "success", "warning", "danger"] }, size: { control: "select", options: ["sm", "md", "lg"] } },
  args: { isSelected: false, isDisabled: false, color: "primary", size: "md" },
}
export default meta
type Story = StoryObj
export const Default: Story = { render: (args) => { const el = document.createElement("ui-checkbox"); if (args.isSelected) el.setAttribute("is-selected", ""); if (args.isDisabled) el.setAttribute("is-disabled", ""); el.setAttribute("color", args.color as string); el.setAttribute("size", args.size as string); el.textContent = "Accept terms"; return el } }
export const Colors: Story = { render: () => { const div = document.createElement("div"); div.style.cssText = "display:flex;gap:1rem"; for (const c of ["primary", "secondary", "success", "warning", "danger"]) { const el = document.createElement("ui-checkbox"); el.setAttribute("is-selected", ""); el.setAttribute("color", c); el.textContent = c; div.appendChild(el) } return div } }
