import type { Meta, StoryObj } from "@storybook/html"
import "./ui-input"

const meta: Meta = {
  title: "Components/Forms/Input",
  component: "ui-input",
  argTypes: {
    variant: { control: "select", options: ["flat", "bordered", "faded", "underlined"] },
    size: { control: "select", options: ["sm", "md", "lg"] },
    placeholder: { control: "text" },
    isDisabled: { control: "boolean" },
    isInvalid: { control: "boolean" },
  },
  args: { variant: "flat", size: "md", placeholder: "Enter text...", isDisabled: false, isInvalid: false },
}
export default meta
type Story = StoryObj

export const Default: Story = {
  render: (args) => {
    const el = document.createElement("ui-input")
    el.setAttribute("variant", args.variant as string)
    el.setAttribute("size", args.size as string)
    el.setAttribute("placeholder", args.placeholder as string)
    if (args.isDisabled) el.setAttribute("is-disabled", "")
    if (args.isInvalid) el.setAttribute("is-invalid", "")
    el.style.width = "300px"
    return el
  },
}

export const Variants: Story = {
  render: () => {
    const div = document.createElement("div")
    div.style.cssText = "display:flex;flex-direction:column;gap:1rem;width:300px"
    for (const v of ["flat", "bordered", "faded", "underlined"]) {
      const el = document.createElement("ui-input")
      el.setAttribute("variant", v)
      el.setAttribute("placeholder", v)
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
      const el = document.createElement("ui-input")
      el.setAttribute("size", s)
      el.setAttribute("placeholder", `Size ${s}`)
      div.appendChild(el)
    }
    return div
  },
}

export const Invalid: Story = {
  render: () => {
    const el = document.createElement("ui-input")
    el.setAttribute("is-invalid", "")
    el.setAttribute("variant", "bordered")
    el.setAttribute("placeholder", "Invalid input")
    el.style.width = "300px"
    return el
  },
}
