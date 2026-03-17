import type { Meta, StoryObj } from "@storybook/html"
import "./ui-input-otp"

const meta: Meta = { title: "Components/Forms/InputOtp", component: "ui-input-otp", argTypes: { length: { control: "number" } }, args: { length: 6 } }
export default meta
type Story = StoryObj
export const Default: Story = { render: (args) => { const el = document.createElement("ui-input-otp"); el.setAttribute("length", String(args.length)); return el } }
