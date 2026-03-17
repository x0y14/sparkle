import type { Meta, StoryObj } from "@storybook/html"
import "./ui-text"

const meta: Meta = {
  title: "Components/Typography/Text",
  component: "ui-text",
  argTypes: { size: { control: "select", options: ["sm", "md", "lg"] } },
  args: { size: "md" },
}
export default meta
type Story = StoryObj

export const Default: Story = {
  render: (args) => {
    const el = document.createElement("ui-text")
    el.setAttribute("size", args.size as string)
    el.textContent = "The quick brown fox jumps over the lazy dog."
    return el
  },
}

export const Sizes: Story = {
  render: () => {
    const div = document.createElement("div")
    div.style.cssText = "display:flex;flex-direction:column;gap:0.5rem"
    for (const s of ["sm", "md", "lg"]) {
      const el = document.createElement("ui-text")
      el.setAttribute("size", s)
      el.textContent = `Size ${s}: The quick brown fox.`
      div.appendChild(el)
    }
    return div
  },
}
