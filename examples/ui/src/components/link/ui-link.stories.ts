import type { Meta, StoryObj } from "@storybook/html"
import "./ui-link"

const meta: Meta = {
  title: "Components/Navigation/Link",
  component: "ui-link",
  argTypes: {
    href: { control: "text" },
    color: { control: "select", options: ["default", "primary", "secondary", "success", "warning", "danger"] },
    underline: { control: "select", options: ["none", "hover", "always", "active"] },
    isExternal: { control: "boolean" },
    isDisabled: { control: "boolean" },
  },
  args: { href: "#", color: "primary", underline: "none", isExternal: false, isDisabled: false },
}
export default meta
type Story = StoryObj

export const Default: Story = {
  render: (args) => {
    const el = document.createElement("ui-link")
    el.setAttribute("href", args.href as string)
    el.setAttribute("color", args.color as string)
    el.setAttribute("underline", args.underline as string)
    if (args.isExternal) el.setAttribute("is-external", "")
    if (args.isDisabled) el.setAttribute("is-disabled", "")
    el.textContent = "Link"
    return el
  },
}

export const Colors: Story = {
  render: () => {
    const div = document.createElement("div")
    div.style.cssText = "display:flex;gap:1rem"
    for (const c of ["default", "primary", "secondary", "success", "warning", "danger"]) {
      const el = document.createElement("ui-link")
      el.setAttribute("href", "#")
      el.setAttribute("color", c)
      el.textContent = c
      div.appendChild(el)
    }
    return div
  },
}

export const External: Story = {
  render: () => {
    const el = document.createElement("ui-link")
    el.setAttribute("href", "https://example.com")
    el.setAttribute("is-external", "")
    el.textContent = "External Link"
    return el
  },
}

export const Disabled: Story = {
  render: () => {
    const el = document.createElement("ui-link")
    el.setAttribute("href", "#")
    el.setAttribute("is-disabled", "")
    el.textContent = "Disabled Link"
    return el
  },
}

export const Underlines: Story = {
  render: () => {
    const div = document.createElement("div")
    div.style.cssText = "display:flex;gap:1rem"
    for (const u of ["none", "hover", "always", "active"]) {
      const el = document.createElement("ui-link")
      el.setAttribute("href", "#")
      el.setAttribute("underline", u)
      el.textContent = u
      div.appendChild(el)
    }
    return div
  },
}
