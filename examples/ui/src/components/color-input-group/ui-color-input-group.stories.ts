import type { Meta, StoryObj } from "@storybook/html"
import "./ui-color-input-group"

const meta: Meta = {
  title: "Components/Color/ColorInputGroup",
  component: "ui-color-input-group",
}
export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => {
    const el = document.createElement("ui-color-input-group")
    el.innerHTML = `
      <span slot="prefix">#</span>
      <input type="text" value="3b82f6" style="border:1px solid #e4e4e7;padding:4px 8px;border-radius:6px" />
    `
    return el
  },
}
