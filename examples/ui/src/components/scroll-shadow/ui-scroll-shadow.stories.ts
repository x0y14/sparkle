import type { Meta, StoryObj } from "@storybook/html"
import "./ui-scroll-shadow"

const meta: Meta = { title: "Components/Layout/ScrollShadow", component: "ui-scroll-shadow" }
export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => {
    const el = document.createElement("ui-scroll-shadow")
    el.style.cssText = "height:200px;width:300px"
    el.innerHTML = Array.from({ length: 20 }, (_, i) => `<p style="padding:8px">Item ${i + 1}</p>`).join("")
    return el
  },
}
