import type { Meta, StoryObj } from "@storybook/html"
import "./ui-toast"

const meta: Meta = {
  title: "Components/Feedback/Toast",
  component: "ui-toast",
  argTypes: {
    variant: { control: "select", options: ["flat", "solid", "bordered"] },
    color: { control: "select", options: ["default", "primary", "secondary", "success", "warning", "danger"] },
    title: { control: "text" },
    description: { control: "text" },
  },
  args: { variant: "flat", color: "default", title: "Notification", description: "This is a toast message." },
}
export default meta
type Story = StoryObj

export const Default: Story = {
  render: (args) => {
    const el = document.createElement("ui-toast")
    el.setAttribute("variant", args.variant as string)
    el.setAttribute("color", args.color as string)
    el.setAttribute("title", args.title as string)
    el.setAttribute("description", args.description as string)
    el.style.maxWidth = "400px"
    return el
  },
}

export const Colors: Story = {
  render: () => {
    const div = document.createElement("div")
    div.style.cssText = "display:flex;flex-direction:column;gap:0.5rem;max-width:400px"
    for (const c of ["default", "primary", "success", "warning", "danger"]) {
      const el = document.createElement("ui-toast")
      el.setAttribute("color", c)
      el.setAttribute("title", c.charAt(0).toUpperCase() + c.slice(1))
      el.setAttribute("description", `This is a ${c} toast.`)
      div.appendChild(el)
    }
    return div
  },
}
