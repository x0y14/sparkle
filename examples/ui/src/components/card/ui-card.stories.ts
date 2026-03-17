import type { Meta, StoryObj } from "@storybook/html"
import "./ui-card"

const meta: Meta = {
  title: "Components/Layout/Card",
  component: "ui-card",
  argTypes: {
    variant: { control: "select", options: ["flat", "bordered", "shadow"] },
    isPressable: { control: "boolean" },
    isDisabled: { control: "boolean" },
  },
  args: { variant: "shadow", isPressable: false, isDisabled: false },
}
export default meta
type Story = StoryObj

export const Default: Story = {
  render: (args) => {
    const el = document.createElement("ui-card")
    el.setAttribute("variant", args.variant as string)
    if (args.isPressable) el.setAttribute("is-pressable", "")
    if (args.isDisabled) el.setAttribute("is-disabled", "")
    el.innerHTML = `<span slot="header"><strong>Card Title</strong></span><p>Card content goes here.</p><span slot="footer"><small>Footer</small></span>`
    return el
  },
}

export const Variants: Story = {
  render: () => {
    const div = document.createElement("div")
    div.style.cssText = "display:flex;gap:1rem"
    for (const v of ["flat", "bordered", "shadow"]) {
      const el = document.createElement("ui-card")
      el.setAttribute("variant", v)
      el.style.width = "200px"
      el.innerHTML = `<span slot="header"><strong>${v}</strong></span><p>Content</p>`
      div.appendChild(el)
    }
    return div
  },
}

export const Pressable: Story = {
  render: () => {
    const el = document.createElement("ui-card")
    el.setAttribute("is-pressable", "")
    el.style.width = "200px"
    el.innerHTML = `<span slot="header"><strong>Clickable</strong></span><p>Click me</p>`
    return el
  },
}
