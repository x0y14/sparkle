import type { Meta, StoryObj } from "@storybook/html"
import "./ui-avatar"

const meta: Meta = {
  title: "Components/Data Display/Avatar",
  component: "ui-avatar",
  argTypes: {
    src: { control: "text" },
    name: { control: "text" },
    size: { control: "select", options: ["sm", "md", "lg"] },
    color: { control: "select", options: ["default", "primary", "secondary", "success", "warning", "danger"] },
    radius: { control: "select", options: ["none", "sm", "md", "lg", "full"] },
    isBordered: { control: "boolean" },
  },
  args: { src: "", name: "John Doe", size: "md", color: "default", radius: "full", isBordered: false },
}
export default meta
type Story = StoryObj

export const Default: Story = {
  render: (args) => {
    const el = document.createElement("ui-avatar")
    if (args.src) el.setAttribute("src", args.src as string)
    el.setAttribute("name", args.name as string)
    el.setAttribute("size", args.size as string)
    el.setAttribute("color", args.color as string)
    el.setAttribute("radius", args.radius as string)
    if (args.isBordered) el.setAttribute("is-bordered", "")
    return el
  },
}

export const Sizes: Story = {
  render: () => {
    const div = document.createElement("div")
    div.style.cssText = "display:flex;gap:1rem;align-items:center"
    for (const s of ["sm", "md", "lg"]) {
      const el = document.createElement("ui-avatar")
      el.setAttribute("name", "Jane Smith")
      el.setAttribute("size", s)
      el.setAttribute("color", "primary")
      div.appendChild(el)
    }
    return div
  },
}

export const Colors: Story = {
  render: () => {
    const div = document.createElement("div")
    div.style.cssText = "display:flex;gap:1rem"
    for (const c of ["default", "primary", "secondary", "success", "warning", "danger"]) {
      const el = document.createElement("ui-avatar")
      el.setAttribute("name", "AB")
      el.setAttribute("color", c)
      div.appendChild(el)
    }
    return div
  },
}

export const Bordered: Story = {
  render: () => {
    const el = document.createElement("ui-avatar")
    el.setAttribute("name", "John Doe")
    el.setAttribute("is-bordered", "")
    el.setAttribute("color", "primary")
    return el
  },
}
