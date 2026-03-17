import type { Meta, StoryObj } from "@storybook/html"
import "./ui-disclosure"
import "./ui-disclosure-group"

const meta: Meta = { title: "Components/Data Display/Disclosure", component: "ui-disclosure" }
export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => {
    const el = document.createElement("ui-disclosure")
    el.setAttribute("title", "Show details")
    el.textContent = "This is the disclosed content."
    return el
  },
}

export const Group: Story = {
  render: () => {
    const el = document.createElement("ui-disclosure-group")
    el.innerHTML = `
      <ui-disclosure title="Section 1">Content 1</ui-disclosure>
      <ui-disclosure title="Section 2">Content 2</ui-disclosure>
    `
    return el
  },
}
