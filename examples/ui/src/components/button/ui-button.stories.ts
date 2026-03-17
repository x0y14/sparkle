import type { Meta, StoryObj } from "@storybook/html"
import "./ui-button"

const meta: Meta = {
  title: "Components/Buttons/Button",
  component: "ui-button",
  argTypes: {
    variant: { control: "select", options: ["solid", "bordered", "light", "flat", "faded", "shadow", "ghost"] },
    color: { control: "select", options: ["default", "primary", "secondary", "success", "warning", "danger"] },
    size: { control: "select", options: ["sm", "md", "lg"] },
    radius: { control: "select", options: ["none", "sm", "md", "lg", "full"] },
    isDisabled: { control: "boolean" },
    isLoading: { control: "boolean" },
    isIconOnly: { control: "boolean" },
    fullWidth: { control: "boolean" },
  },
  args: { variant: "solid", color: "primary", size: "md", radius: "md", isDisabled: false, isLoading: false, isIconOnly: false, fullWidth: false },
}
export default meta
type Story = StoryObj

export const Default: Story = {
  render: (args) => {
    const el = document.createElement("ui-button")
    el.setAttribute("variant", args.variant as string)
    el.setAttribute("color", args.color as string)
    el.setAttribute("size", args.size as string)
    el.setAttribute("radius", args.radius as string)
    if (args.isDisabled) el.setAttribute("is-disabled", "")
    if (args.isLoading) el.setAttribute("is-loading", "")
    if (args.isIconOnly) el.setAttribute("is-icon-only", "")
    if (args.fullWidth) el.setAttribute("full-width", "")
    el.textContent = "Button"
    return el
  },
}

export const Variants: Story = {
  render: () => {
    const div = document.createElement("div")
    div.style.cssText = "display:flex;gap:0.5rem;flex-wrap:wrap"
    for (const v of ["solid", "bordered", "light", "flat", "faded", "shadow", "ghost"]) {
      const el = document.createElement("ui-button")
      el.setAttribute("variant", v)
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
      const el = document.createElement("ui-button")
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
      const el = document.createElement("ui-button")
      el.setAttribute("size", s)
      el.textContent = s
      div.appendChild(el)
    }
    return div
  },
}

export const Disabled: Story = {
  render: () => {
    const el = document.createElement("ui-button")
    el.setAttribute("is-disabled", "")
    el.textContent = "Disabled"
    return el
  },
}

export const Loading: Story = {
  render: () => {
    const el = document.createElement("ui-button")
    el.setAttribute("is-loading", "")
    el.textContent = "Loading..."
    return el
  },
}

export const FullWidth: Story = {
  render: () => {
    const el = document.createElement("ui-button")
    el.setAttribute("full-width", "")
    el.textContent = "Full Width Button"
    el.style.width = "300px"
    return el
  },
}
