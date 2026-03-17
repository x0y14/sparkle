import type { Meta, StoryObj } from "@storybook/html"
import "./ui-toggle-button-group"
import "../toggle-button/ui-toggle-button"

const meta: Meta = { title: "Components/Buttons/ToggleButtonGroup", component: "ui-toggle-button-group" }
export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => {
    const el = document.createElement("ui-toggle-button-group")
    el.innerHTML = `<ui-toggle-button>A</ui-toggle-button><ui-toggle-button is-selected>B</ui-toggle-button><ui-toggle-button>C</ui-toggle-button>`
    return el
  },
}
