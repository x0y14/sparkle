import type { Meta, StoryObj } from "@storybook/html"
import "./ui-combo-box"

const meta: Meta = {
  title: "Components/Forms/ComboBox",
  component: "ui-combo-box",
  argTypes: {
    placeholder: { control: "text" },
    isDisabled: { control: "boolean" },
    selectedKey: { control: "text" },
  },
  args: { placeholder: "Select an option...", isDisabled: false, selectedKey: "" },
}
export default meta
type Story = StoryObj

export const Default: Story = {
  render: (args) => {
    const el = document.createElement("ui-combo-box")
    el.setAttribute("placeholder", args.placeholder as string)
    if (args.isDisabled) el.setAttribute("is-disabled", "")
    if (args.selectedKey) el.setAttribute("selected-key", args.selectedKey as string)
    el.style.width = "300px"
    return el
  },
}

export const Disabled: Story = {
  render: () => {
    const el = document.createElement("ui-combo-box")
    el.setAttribute("placeholder", "Select...")
    el.setAttribute("is-disabled", "")
    el.style.width = "300px"
    return el
  },
}
