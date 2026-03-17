import type { Meta, StoryObj } from "@storybook/html"
import "./ui-progress-circle"

const meta: Meta = {
  title: "Components/Feedback/ProgressCircle",
  component: "ui-progress-circle",
  argTypes: {
    value: { control: { type: "range", min: 0, max: 100 } },
    color: { control: "select", options: ["default", "primary", "secondary", "success", "warning", "danger"] },
    size: { control: "select", options: ["sm", "md", "lg"] },
  },
  args: { value: 60, color: "primary", size: "md" },
}
export default meta
type Story = StoryObj

export const Default: Story = {
  render: (args) => {
    const el = document.createElement("ui-progress-circle")
    el.setAttribute("value", String(args.value))
    el.setAttribute("color", args.color as string)
    el.setAttribute("size", args.size as string)
    return el
  },
}

export const Colors: Story = {
  render: () => {
    const div = document.createElement("div")
    div.style.cssText = "display:flex;gap:1rem"
    for (const c of ["primary", "secondary", "success", "warning", "danger"]) {
      const el = document.createElement("ui-progress-circle")
      el.setAttribute("value", "70")
      el.setAttribute("color", c)
      div.appendChild(el)
    }
    return div
  },
}

export const Sizes: Story = {
  render: () => {
    const div = document.createElement("div")
    div.style.cssText = "display:flex;gap:1rem;align-items:center"
    for (const s of ["sm", "md", "lg"]) {
      const el = document.createElement("ui-progress-circle")
      el.setAttribute("value", "70")
      el.setAttribute("size", s)
      div.appendChild(el)
    }
    return div
  },
}
