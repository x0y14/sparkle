import type { Meta, StoryObj } from "@storybook/html"
import "./ui-kbd"

const meta: Meta = {
  title: "Components/Data Display/Kbd",
  component: "ui-kbd",
}
export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => {
    const el = document.createElement("ui-kbd")
    el.textContent = "⌘"
    return el
  },
}

export const Combinations: Story = {
  render: () => {
    const div = document.createElement("div")
    div.style.cssText = "display:flex;gap:0.25rem;align-items:center"
    const keys = ["⌘", "C"]
    keys.forEach((k, i) => {
      const el = document.createElement("ui-kbd")
      el.textContent = k
      div.appendChild(el)
      if (i < keys.length - 1) {
        const plus = document.createElement("span")
        plus.textContent = "+"
        plus.style.margin = "0 0.25rem"
        div.appendChild(plus)
      }
    })
    return div
  },
}
