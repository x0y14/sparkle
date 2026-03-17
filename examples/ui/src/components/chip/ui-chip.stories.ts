import type { Meta, StoryObj } from "@storybook/html"
import "./ui-chip"

const meta: Meta = {
  title: "Components/Data Display/Chip",
  component: "ui-chip",
  argTypes: {
    color: { control: "select", options: ["default", "primary", "secondary", "success", "warning", "danger"] },
    size: { control: "select", options: ["sm", "md", "lg"] },
    variant: { control: "select", options: ["solid", "flat", "bordered", "light"] },
    radius: { control: "select", options: ["none", "sm", "md", "lg", "full"] },
    isCloseable: { control: "boolean" },
  },
  args: { color: "default", size: "md", variant: "solid", radius: "full", isCloseable: false },
}
export default meta
type Story = StoryObj

export const Default: Story = {
  render: (args) => {
    const el = document.createElement("ui-chip")
    el.setAttribute("color", args.color as string)
    el.setAttribute("size", args.size as string)
    el.setAttribute("variant", args.variant as string)
    el.setAttribute("radius", args.radius as string)
    if (args.isCloseable) el.setAttribute("is-closeable", "")
    el.textContent = "Chip"
    return el
  },
}

export const Variants: Story = {
  render: () => {
    const div = document.createElement("div")
    div.style.cssText = "display:flex;gap:0.5rem;flex-wrap:wrap"
    for (const v of ["solid", "flat", "bordered", "light"]) {
      const el = document.createElement("ui-chip")
      el.setAttribute("variant", v)
      el.setAttribute("color", "primary")
      el.textContent = v
      div.appendChild(el)
    }
    return div
  },
}

export const Colors: Story = {
  render: () => {
    const div = document.createElement("div")
    div.style.cssText = "display:flex;gap:0.5rem;flex-wrap:wrap"
    for (const c of ["default", "primary", "secondary", "success", "warning", "danger"]) {
      const el = document.createElement("ui-chip")
      el.setAttribute("color", c)
      el.textContent = c
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
      const el = document.createElement("ui-chip")
      el.setAttribute("size", s)
      el.textContent = s
      div.appendChild(el)
    }
    return div
  },
}

export const Closeable: Story = {
  render: () => {
    const el = document.createElement("ui-chip")
    el.setAttribute("is-closeable", "")
    el.setAttribute("color", "primary")
    el.textContent = "Closeable"
    el.addEventListener("close", () => el.remove())
    return el
  },
}
