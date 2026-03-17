import type { Meta, StoryObj } from "@storybook/html"
import "./ui-surface"

const meta: Meta = {
  title: "Components/Layout/Surface",
  component: "ui-surface",
  argTypes: { variant: { control: "select", options: ["default", "secondary", "tertiary"] } },
  args: { variant: "default" },
}
export default meta
type Story = StoryObj

export const Default: Story = {
  render: (args) => {
    const el = document.createElement("ui-surface")
    el.setAttribute("variant", args.variant as string)
    el.textContent = "Surface content"
    return el
  },
}

export const Variants: Story = {
  render: () => {
    const div = document.createElement("div")
    div.style.cssText = "display:flex;flex-direction:column;gap:1rem"
    for (const v of ["default", "secondary", "tertiary"]) {
      const el = document.createElement("ui-surface")
      el.setAttribute("variant", v)
      el.textContent = `Variant: ${v}`
      div.appendChild(el)
    }
    return div
  },
}
