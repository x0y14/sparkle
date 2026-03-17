import type { Meta, StoryObj } from "@storybook/html"
import "./ui-switch-group"
import "../switch/ui-switch"

const meta: Meta = { title: "Components/Forms/SwitchGroup", component: "ui-switch-group" }
export default meta
type Story = StoryObj
export const Default: Story = { render: () => { const el = document.createElement("ui-switch-group"); el.setAttribute("label", "Notifications"); el.innerHTML = `<ui-switch is-selected>Email</ui-switch><ui-switch>SMS</ui-switch><ui-switch>Push</ui-switch>`; return el } }
