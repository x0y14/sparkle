import type { Meta, StoryObj } from "@storybook/html"
import "./ui-list-box"
import "./ui-list-box-item"
import "./ui-list-box-section"

const meta: Meta = { title: "Components/Inputs/ListBox", component: "ui-list-box" }
export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => {
    const el = document.createElement("ui-list-box")
    el.innerHTML = `
      <ui-list-box-section title="Fruits">
        <ui-list-box-item key="apple">Apple</ui-list-box-item>
        <ui-list-box-item key="banana">Banana</ui-list-box-item>
      </ui-list-box-section>
      <ui-list-box-section title="Vegetables">
        <ui-list-box-item key="carrot">Carrot</ui-list-box-item>
        <ui-list-box-item key="potato" is-disabled>Potato</ui-list-box-item>
      </ui-list-box-section>
    `
    return el
  },
}
