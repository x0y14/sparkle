import type { Meta, StoryObj } from "@storybook/html"
import "./ui-input-group"

const meta: Meta = { title: "Components/Forms/InputGroup", component: "ui-input-group" }
export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => {
    const el = document.createElement("ui-input-group")
    el.setAttribute("variant", "bordered")
    el.innerHTML = `<span slot="prefix" style="padding:0 8px;color:#71717a">$</span><input style="flex:1;border:none;outline:none;background:transparent" placeholder="Amount">`
    el.style.width = "300px"
    return el
  },
}
