import type { Meta, StoryObj } from "@storybook/html"
import "./ui-badge"

const meta: Meta = {
  title: "Components/Data Display/Badge",
  component: "ui-badge",
  argTypes: {
    content: { control: "text" },
    color: { control: "select", options: ["default", "primary", "secondary", "success", "warning", "danger"] },
    size: { control: "select", options: ["sm", "md", "lg"] },
    placement: { control: "select", options: ["top-right", "top-left", "bottom-right", "bottom-left"] },
    isInvisible: { control: "boolean" },
  },
  args: { content: "5", color: "danger", size: "md", placement: "top-right", isInvisible: false },
}
export default meta
type Story = StoryObj

export const Default: Story = {
  render: (args) => {
    const el = document.createElement("ui-badge")
    el.setAttribute("content", args.content as string)
    el.setAttribute("color", args.color as string)
    el.setAttribute("size", args.size as string)
    el.setAttribute("placement", args.placement as string)
    if (args.isInvisible) el.setAttribute("is-invisible", "")
    el.innerHTML = `<div style="width:48px;height:48px;border-radius:12px;background:#e4e4e7"></div>`
    return el
  },
}

export const Colors: Story = {
  render: () => {
    const div = document.createElement("div")
    div.style.cssText = "display:flex;gap:2rem"
    for (const color of ["default", "primary", "secondary", "success", "warning", "danger"]) {
      const el = document.createElement("ui-badge")
      el.setAttribute("content", "5")
      el.setAttribute("color", color)
      el.innerHTML = `<div style="width:48px;height:48px;border-radius:12px;background:#e4e4e7"></div>`
      div.appendChild(el)
    }
    return div
  },
}

export const Sizes: Story = {
  render: () => {
    const div = document.createElement("div")
    div.style.cssText = "display:flex;gap:2rem"
    for (const size of ["sm", "md", "lg"]) {
      const el = document.createElement("ui-badge")
      el.setAttribute("content", "9")
      el.setAttribute("size", size)
      el.innerHTML = `<div style="width:48px;height:48px;border-radius:12px;background:#e4e4e7"></div>`
      div.appendChild(el)
    }
    return div
  },
}

export const Placements: Story = {
  render: () => {
    const div = document.createElement("div")
    div.style.cssText = "display:flex;gap:2rem"
    for (const p of ["top-right", "top-left", "bottom-right", "bottom-left"]) {
      const el = document.createElement("ui-badge")
      el.setAttribute("content", "5")
      el.setAttribute("placement", p)
      el.innerHTML = `<div style="width:48px;height:48px;border-radius:12px;background:#e4e4e7"></div>`
      div.appendChild(el)
    }
    return div
  },
}

export const Invisible: Story = {
  render: () => {
    const el = document.createElement("ui-badge")
    el.setAttribute("content", "5")
    el.setAttribute("is-invisible", "")
    el.innerHTML = `<div style="width:48px;height:48px;border-radius:12px;background:#e4e4e7"></div>`
    return el
  },
}
