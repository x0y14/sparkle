import type { Meta, StoryObj } from "@storybook/html"
import "./ui-slider"

const meta: Meta = {
  title: "Components/Forms/Slider",
  component: "ui-slider",
  argTypes: { value: { control: { type: "range", min: 0, max: 100 } }, color: { control: "select", options: ["default", "primary", "secondary", "success", "warning", "danger"] }, label: { control: "text" } },
  args: { value: 50, color: "primary", label: "" },
}
export default meta
type Story = StoryObj
export const Default: Story = { render: (args) => { const el = document.createElement("ui-slider"); el.setAttribute("value", String(args.value)); el.setAttribute("color", args.color as string); if (args.label) el.setAttribute("label", args.label as string); el.style.width = "300px"; return el } }
export const WithLabel: Story = { render: () => { const el = document.createElement("ui-slider"); el.setAttribute("value", "60"); el.setAttribute("label", "Volume"); el.style.width = "300px"; return el } }
