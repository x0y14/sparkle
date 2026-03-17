import type { Meta, StoryObj } from "@storybook/html"
import "./ui-checkbox-group"
import "../checkbox/ui-checkbox"

const meta: Meta = { title: "Components/Forms/CheckboxGroup", component: "ui-checkbox-group" }
export default meta
type Story = StoryObj
export const Default: Story = {
  render: () => {
    const el = document.createElement("ui-checkbox-group")
    el.setAttribute("label", "Interests")
    el.innerHTML = `<ui-checkbox value="sports">Sports</ui-checkbox><ui-checkbox value="music">Music</ui-checkbox><ui-checkbox value="coding" is-selected>Coding</ui-checkbox>`
    return el
  },
}
