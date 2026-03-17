import type { Meta, StoryObj } from "@storybook/html"
import "./ui-textfield"
import "../input/ui-input"

const meta: Meta = {
  title: "Components/Forms/TextField",
  component: "ui-textfield",
  argTypes: { label: { control: "text" }, description: { control: "text" }, errorMessage: { control: "text" }, isInvalid: { control: "boolean" } },
  args: { label: "Email", description: "We'll never share your email.", errorMessage: "", isInvalid: false },
}
export default meta
type Story = StoryObj

export const Default: Story = {
  render: (args) => {
    const el = document.createElement("ui-textfield")
    el.setAttribute("label", args.label as string)
    el.setAttribute("description", args.description as string)
    if (args.isInvalid) { el.setAttribute("is-invalid", ""); el.setAttribute("error-message", args.errorMessage as string) }
    el.innerHTML = `<ui-input placeholder="email@example.com"></ui-input>`
    el.style.width = "300px"
    return el
  },
}

export const WithError: Story = {
  render: () => {
    const el = document.createElement("ui-textfield")
    el.setAttribute("label", "Email")
    el.setAttribute("is-invalid", "")
    el.setAttribute("error-message", "This field is required")
    el.innerHTML = `<ui-input is-invalid placeholder="email@example.com"></ui-input>`
    el.style.width = "300px"
    return el
  },
}
