import type { Meta, StoryObj } from "@storybook/html"
import "./ui-accordion"
import "./ui-accordion-item"

const meta: Meta = { title: "Components/Data Display/Accordion", component: "ui-accordion" }
export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => {
    const el = document.createElement("ui-accordion")
    el.innerHTML = `
      <ui-accordion-item title="Item 1">Content for item 1</ui-accordion-item>
      <ui-accordion-item title="Item 2" subtitle="Optional subtitle">Content for item 2</ui-accordion-item>
      <ui-accordion-item title="Item 3">Content for item 3</ui-accordion-item>
    `
    return el
  },
}

export const Disabled: Story = {
  render: () => {
    const el = document.createElement("ui-accordion")
    el.setAttribute("is-disabled", "")
    el.innerHTML = `
      <ui-accordion-item title="Disabled Item">Content</ui-accordion-item>
    `
    return el
  },
}
