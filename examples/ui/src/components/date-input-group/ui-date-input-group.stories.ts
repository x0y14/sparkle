import type { Meta, StoryObj } from "@storybook/html"
import "./ui-date-input-group"

const meta: Meta = { title: "Components/Date/DateInputGroup", component: "ui-date-input-group" }
export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => {
    const el = document.createElement("ui-date-input-group")
    el.innerHTML = `<span slot="prefix" style="padding-right:8px;color:#71717a">📅</span><input style="flex:1;border:none;outline:none;background:transparent" placeholder="YYYY-MM-DD">`
    el.style.width = "250px"
    return el
  },
}
