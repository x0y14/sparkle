import type { Meta, StoryObj } from "@storybook/html"
import "./ui-radio-group"
import "../radio/ui-radio"

const meta: Meta = { title: "Components/Forms/RadioGroup", component: "ui-radio-group" }
export default meta
type Story = StoryObj
export const Default: Story = {
  render: () => {
    const el = document.createElement("ui-radio-group")
    el.setAttribute("label", "Size")
    el.innerHTML = `<ui-radio value="sm">Small</ui-radio><ui-radio value="md" is-selected>Medium</ui-radio><ui-radio value="lg">Large</ui-radio>`
    return el
  },
}
