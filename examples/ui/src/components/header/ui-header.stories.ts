import type { Meta, StoryObj } from "@storybook/html"
import "./ui-header"

const meta: Meta = {
  title: "Components/Typography/Header",
  component: "ui-header",
  argTypes: { level: { control: { type: "number", min: 1, max: 6 } } },
  args: { level: 3 },
}
export default meta
type Story = StoryObj

export const Default: Story = {
  render: (args) => {
    const el = document.createElement("ui-header")
    el.setAttribute("level", String(args.level))
    el.textContent = "Heading"
    return el
  },
}

export const AllLevels: Story = {
  render: () => {
    const div = document.createElement("div")
    div.style.cssText = "display:flex;flex-direction:column;gap:0.5rem"
    for (let i = 1; i <= 6; i++) {
      const el = document.createElement("ui-header")
      el.setAttribute("level", String(i))
      el.textContent = `Heading Level ${i}`
      div.appendChild(el)
    }
    return div
  },
}
