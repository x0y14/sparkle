import type { Meta, StoryObj } from "@storybook/html"
import "./ui-alert"

const meta: Meta = {
  title: "Components/Feedback/Alert",
  component: "ui-alert",
  argTypes: {
    color: { control: "select", options: ["default", "primary", "secondary", "success", "warning", "danger"] },
    variant: { control: "select", options: ["flat", "bordered", "solid"] },
    title: { control: "text" },
    isCloseable: { control: "boolean" },
  },
  args: { color: "default", variant: "flat", title: "Alert Title", isCloseable: false },
}
export default meta
type Story = StoryObj

export const Default: Story = {
  render: (args) => {
    const el = document.createElement("ui-alert")
    el.setAttribute("color", args.color as string)
    el.setAttribute("variant", args.variant as string)
    el.setAttribute("title", args.title as string)
    if (args.isCloseable) el.setAttribute("is-closeable", "")
    el.textContent = "This is an alert description."
    return el
  },
}

export const Colors: Story = {
  render: () => {
    const div = document.createElement("div")
    div.style.cssText = "display:flex;flex-direction:column;gap:1rem;width:400px"
    for (const c of ["default", "primary", "secondary", "success", "warning", "danger"]) {
      const el = document.createElement("ui-alert")
      el.setAttribute("color", c)
      el.setAttribute("title", c.charAt(0).toUpperCase() + c.slice(1))
      el.textContent = "Alert description text."
      div.appendChild(el)
    }
    return div
  },
}

export const Variants: Story = {
  render: () => {
    const div = document.createElement("div")
    div.style.cssText = "display:flex;flex-direction:column;gap:1rem;width:400px"
    for (const v of ["flat", "bordered", "solid"]) {
      const el = document.createElement("ui-alert")
      el.setAttribute("variant", v)
      el.setAttribute("color", "primary")
      el.setAttribute("title", v)
      el.textContent = "Alert description."
      div.appendChild(el)
    }
    return div
  },
}

export const Closeable: Story = {
  render: () => {
    const el = document.createElement("ui-alert")
    el.setAttribute("is-closeable", "")
    el.setAttribute("color", "warning")
    el.setAttribute("title", "Closeable Alert")
    el.textContent = "Click the X to dismiss."
    el.addEventListener("close", () => el.remove())
    return el
  },
}
