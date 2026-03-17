import type { Meta, StoryObj } from "@storybook/html"
import "./ui-number-field"

const meta: Meta = { title: "Components/Forms/NumberField", component: "ui-number-field", argTypes: { value: { control: "number" }, label: { control: "text" } }, args: { value: 0, label: "" } }
export default meta
type Story = StoryObj
export const Default: Story = { render: (args) => { const el = document.createElement("ui-number-field"); el.setAttribute("value", String(args.value)); if (args.label) el.setAttribute("label", args.label as string); return el } }
