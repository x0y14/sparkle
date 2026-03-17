import type { Meta, StoryObj } from "@storybook/html"
import "./ui-color-swatch"

const meta: Meta = {
  title: "Components/Color/ColorSwatch",
  component: "ui-color-swatch",
  argTypes: {
    color: { control: "color" },
    size: { control: "select", options: ["sm", "md", "lg"] },
  },
  args: { color: "#000000", size: "md" },
}
export default meta
type Story = StoryObj

export const Default: Story = {
  render: (args) => {
    const el = document.createElement("ui-color-swatch")
    el.setAttribute("color", args.color as string)
    el.setAttribute("size", args.size as string)
    return el
  },
}

export const Colors: Story = {
  render: () => {
    const div = document.createElement("div")
    div.style.cssText = "display:flex;gap:0.5rem"
    for (const c of ["#ef4444", "#f59e0b", "#22c55e", "#3b82f6", "#8b5cf6", "#000000"]) {
      const el = document.createElement("ui-color-swatch")
      el.setAttribute("color", c)
      div.appendChild(el)
    }
    return div
  },
}

export const Sizes: Story = {
  render: () => {
    const div = document.createElement("div")
    div.style.cssText = "display:flex;gap:0.5rem;align-items:center"
    for (const s of ["sm", "md", "lg"]) {
      const el = document.createElement("ui-color-swatch")
      el.setAttribute("size", s)
      el.setAttribute("color", "#3b82f6")
      div.appendChild(el)
    }
    return div
  },
}
