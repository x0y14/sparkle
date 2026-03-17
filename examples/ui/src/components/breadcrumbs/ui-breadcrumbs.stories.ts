import type { Meta, StoryObj } from "@storybook/html"
import "./ui-breadcrumbs"
import "./ui-breadcrumbs-item"

const meta: Meta = { title: "Components/Navigation/Breadcrumbs", component: "ui-breadcrumbs" }
export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => {
    const el = document.createElement("ui-breadcrumbs")
    el.innerHTML = `
      <ui-breadcrumbs-item href="/">Home</ui-breadcrumbs-item>
      <ui-breadcrumbs-item href="/docs">Docs</ui-breadcrumbs-item>
      <ui-breadcrumbs-item is-current>Components</ui-breadcrumbs-item>
    `
    return el
  },
}
