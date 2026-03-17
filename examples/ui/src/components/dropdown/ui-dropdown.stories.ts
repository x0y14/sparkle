import type { Meta, StoryObj } from "@storybook/html"
import "./ui-dropdown"
import "./ui-dropdown-menu"
import "./ui-dropdown-item"

const meta: Meta = { title: "Components/Overlays/Dropdown", component: "ui-dropdown" }
export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => {
    const el = document.createElement("ui-dropdown")
    el.innerHTML = `
      <ui-button slot="trigger">Open Menu</ui-button>
      <ui-dropdown-menu>
        <ui-dropdown-item key="edit">Edit</ui-dropdown-item>
        <ui-dropdown-item key="delete">Delete</ui-dropdown-item>
        <ui-dropdown-item key="disabled" is-disabled>Disabled</ui-dropdown-item>
      </ui-dropdown-menu>
    `
    return el
  },
}
