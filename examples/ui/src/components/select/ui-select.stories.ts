import type { Meta, StoryObj } from "@storybook/html"
import "./ui-select"

const meta: Meta = { title: "Components/Forms/Select", component: "ui-select", argTypes: { placeholder: { control: "text" } }, args: { placeholder: "Select an option" } }
export default meta
type Story = StoryObj
export const Default: Story = {
  render: (args) => {
    const el = document.createElement("ui-select")
    el.setAttribute("placeholder", args.placeholder as string)
    el.innerHTML = `<div data-key="a" style="padding:8px 12px;cursor:pointer">Option A</div><div data-key="b" style="padding:8px 12px;cursor:pointer">Option B</div><div data-key="c" style="padding:8px 12px;cursor:pointer">Option C</div>`
    el.style.width = "250px"
    return el
  },
}
