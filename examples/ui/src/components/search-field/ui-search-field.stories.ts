import type { Meta, StoryObj } from "@storybook/html"
import "./ui-search-field"

const meta: Meta = { title: "Components/Forms/SearchField", component: "ui-search-field", argTypes: { placeholder: { control: "text" } }, args: { placeholder: "Search..." } }
export default meta
type Story = StoryObj
export const Default: Story = { render: (args) => { const el = document.createElement("ui-search-field"); el.setAttribute("placeholder", args.placeholder as string); el.style.width = "300px"; return el } }
