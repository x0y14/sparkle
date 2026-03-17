import type { Meta, StoryObj } from "@storybook/html"
import "./ui-tabs"
import "./ui-tab"

const meta: Meta = { title: "Components/Navigation/Tabs", component: "ui-tabs" }
export default meta
type Story = StoryObj
export const Default: Story = {
  render: () => {
    const el = document.createElement("ui-tabs")
    el.innerHTML = `<ui-tab slot="tab" title="Tab 1" key="1">Content 1</ui-tab><ui-tab slot="tab" title="Tab 2" key="2">Content 2</ui-tab><ui-tab slot="tab" title="Tab 3" key="3">Content 3</ui-tab>`
    return el
  },
}
