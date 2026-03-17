import type { Meta, StoryObj } from "@storybook/html"
import "./ui-form"

const meta: Meta = { title: "Components/Forms/Form", component: "ui-form" }
export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => {
    const el = document.createElement("ui-form")
    el.innerHTML = `
      <ui-textfield label="Name"></ui-textfield>
      <ui-button type="submit">Submit</ui-button>
    `
    return el
  },
}
