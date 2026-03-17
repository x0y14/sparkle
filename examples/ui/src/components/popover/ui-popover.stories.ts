import type { Meta, StoryObj } from "@storybook/html"
import "./ui-popover"

const meta: Meta = {
  title: "Components/Overlays/Popover",
  component: "ui-popover",
  argTypes: {
    placement: { control: "select", options: ["top", "bottom", "left", "right"] },
    isOpen: { control: "boolean" },
  },
  args: { placement: "bottom", isOpen: false },
}
export default meta
type Story = StoryObj

export const Default: Story = {
  render: (args) => {
    const el = document.createElement("ui-popover")
    el.setAttribute("placement", args.placement as string)
    if (args.isOpen) el.setAttribute("is-open", "")
    el.innerHTML = `
      <button slot="trigger" style="padding:6px 16px;border:1px solid #e4e4e7;border-radius:8px;cursor:pointer">Toggle Popover</button>
      <div><p style="font-weight:600;margin-bottom:4px">Popover Title</p><p style="font-size:14px;color:#71717a">Popover content goes here.</p></div>
    `
    return el
  },
}

export const Placements: Story = {
  render: () => {
    const div = document.createElement("div")
    div.style.cssText = "display:flex;gap:2rem;padding:6rem;justify-content:center"
    for (const p of ["top", "bottom", "left", "right"]) {
      const el = document.createElement("ui-popover")
      el.setAttribute("placement", p)
      el.setAttribute("is-open", "")
      el.innerHTML = `
        <button slot="trigger" style="padding:6px 16px;border:1px solid #e4e4e7;border-radius:8px">${p}</button>
        <div><p>Content</p></div>
      `
      div.appendChild(el)
    }
    return div
  },
}
