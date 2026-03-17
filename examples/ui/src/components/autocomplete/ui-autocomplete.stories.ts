import type { Meta, StoryObj } from "@storybook/html"
import "./ui-autocomplete"

const meta: Meta = {
  title: "Components/Forms/Autocomplete",
  component: "ui-autocomplete",
  argTypes: {
    placeholder: { control: "text" },
    isDisabled: { control: "boolean" },
  },
  args: { placeholder: "Search...", isDisabled: false },
}
export default meta
type Story = StoryObj

export const Default: Story = {
  render: (args) => {
    const el = document.createElement("ui-autocomplete")
    el.setAttribute("placeholder", args.placeholder as string)
    if (args.isDisabled) el.setAttribute("is-disabled", "")
    el.style.width = "300px"
    return el
  },
}

export const Disabled: Story = {
  render: () => {
    const el = document.createElement("ui-autocomplete")
    el.setAttribute("placeholder", "Search...")
    el.setAttribute("is-disabled", "")
    el.style.width = "300px"
    return el
  },
}
