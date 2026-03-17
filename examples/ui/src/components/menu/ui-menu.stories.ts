import type { Meta, StoryObj } from "@storybook/html"
import "./ui-menu"
import "./ui-menu-item"
import "./ui-menu-section"

const meta: Meta = { title: "Components/Navigation/Menu", component: "ui-menu" }
export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => {
    const el = document.createElement("ui-menu")
    el.innerHTML = `
      <ui-menu-section title="Actions">
        <ui-menu-item key="edit">Edit</ui-menu-item>
        <ui-menu-item key="copy">Copy</ui-menu-item>
      </ui-menu-section>
      <ui-menu-section title="Danger">
        <ui-menu-item key="delete">Delete</ui-menu-item>
      </ui-menu-section>
    `
    return el
  },
}
