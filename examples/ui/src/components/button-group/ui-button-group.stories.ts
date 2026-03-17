import type { Meta, StoryObj } from "@storybook/html"
import "./ui-button-group"
import "../button/ui-button"

const meta: Meta = { title: "Components/Buttons/ButtonGroup", component: "ui-button-group" }
export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => {
    const el = document.createElement("ui-button-group")
    el.innerHTML = `<ui-button>One</ui-button><ui-button>Two</ui-button><ui-button>Three</ui-button>`
    return el
  },
}
