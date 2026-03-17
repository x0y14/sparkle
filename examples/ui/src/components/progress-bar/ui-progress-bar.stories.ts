import type { Meta, StoryObj } from "@storybook/html"
import "./ui-progress-bar"

const meta: Meta = {
  title: "Components/Feedback/ProgressBar",
  component: "ui-progress-bar",
  argTypes: {
    value: { control: { type: "range", min: 0, max: 100 } },
    maxValue: { control: "number" },
    color: { control: "select", options: ["default", "primary", "secondary", "success", "warning", "danger"] },
    size: { control: "select", options: ["sm", "md", "lg"] },
    label: { control: "text" },
    isIndeterminate: { control: "boolean" },
  },
  args: { value: 50, maxValue: 100, color: "primary", size: "md", label: "", isIndeterminate: false },
}
export default meta
type Story = StoryObj

export const Default: Story = {
  render: (args) => {
    const el = document.createElement("ui-progress-bar")
    el.setAttribute("value", String(args.value))
    el.setAttribute("max-value", String(args.maxValue))
    el.setAttribute("color", args.color as string)
    el.setAttribute("size", args.size as string)
    if (args.label) el.setAttribute("label", args.label as string)
    if (args.isIndeterminate) el.setAttribute("is-indeterminate", "")
    el.style.width = "300px"
    return el
  },
}

export const Colors: Story = {
  render: () => {
    const div = document.createElement("div")
    div.style.cssText = "display:flex;flex-direction:column;gap:1rem;width:300px"
    for (const c of ["default", "primary", "secondary", "success", "warning", "danger"]) {
      const el = document.createElement("ui-progress-bar")
      el.setAttribute("value", "60")
      el.setAttribute("color", c)
      div.appendChild(el)
    }
    return div
  },
}

export const Sizes: Story = {
  render: () => {
    const div = document.createElement("div")
    div.style.cssText = "display:flex;flex-direction:column;gap:1rem;width:300px"
    for (const s of ["sm", "md", "lg"]) {
      const el = document.createElement("ui-progress-bar")
      el.setAttribute("value", "60")
      el.setAttribute("size", s)
      div.appendChild(el)
    }
    return div
  },
}

export const Indeterminate: Story = {
  render: () => {
    const el = document.createElement("ui-progress-bar")
    el.setAttribute("is-indeterminate", "")
    el.style.width = "300px"
    return el
  },
}

export const WithLabel: Story = {
  render: () => {
    const el = document.createElement("ui-progress-bar")
    el.setAttribute("value", "75")
    el.setAttribute("label", "Uploading...")
    el.style.width = "300px"
    return el
  },
}
