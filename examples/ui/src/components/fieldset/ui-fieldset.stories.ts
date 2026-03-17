import type { Meta, StoryObj } from "@storybook/html"
import "./ui-fieldset"

const meta: Meta = {
  title: "Components/Forms/Fieldset",
  component: "ui-fieldset",
  argTypes: {
    legend: { control: "text" },
    isDisabled: { control: "boolean" },
  },
  args: { legend: "Personal Info", isDisabled: false },
}
export default meta
type Story = StoryObj

export const Default: Story = {
  render: (args) => {
    const el = document.createElement("ui-fieldset")
    if (args.legend) el.setAttribute("legend", args.legend as string)
    if (args.isDisabled) el.setAttribute("is-disabled", "")
    el.innerHTML = `
      <ui-textfield label="First Name"></ui-textfield>
      <ui-textfield label="Last Name"></ui-textfield>
    `
    return el
  },
}

export const Disabled: Story = {
  render: () => {
    const el = document.createElement("ui-fieldset")
    el.setAttribute("legend", "Disabled Group")
    el.setAttribute("is-disabled", "")
    el.innerHTML = `
      <ui-textfield label="Field"></ui-textfield>
    `
    return el
  },
}
