import type { Meta, StoryObj } from "@storybook/html"
import "./ui-close-button"

const meta: Meta = {
  title: "Components/Buttons/CloseButton",
  component: "ui-close-button",
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
    isDisabled: { control: "boolean" },
  },
  args: { size: "md", isDisabled: false },
}
export default meta
type Story = StoryObj

export const Default: Story = {
  render: (args) => {
    const el = document.createElement("ui-close-button")
    el.setAttribute("size", args.size as string)
    if (args.isDisabled) el.setAttribute("is-disabled", "")
    return el
  },
}

export const Sizes: Story = {
  render: () => {
    const div = document.createElement("div")
    div.style.cssText = "display:flex;gap:1rem;align-items:center"
    for (const s of ["sm", "md", "lg"]) {
      const el = document.createElement("ui-close-button")
      el.setAttribute("size", s)
      div.appendChild(el)
    }
    return div
  },
}

export const Disabled: Story = {
  render: () => {
    const el = document.createElement("ui-close-button")
    el.setAttribute("is-disabled", "")
    return el
  },
}
