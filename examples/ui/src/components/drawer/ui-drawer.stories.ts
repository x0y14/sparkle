import type { Meta, StoryObj } from "@storybook/html"
import "./ui-drawer"

const meta: Meta = {
  title: "Components/Overlays/Drawer",
  component: "ui-drawer",
  argTypes: {
    isOpen: { control: "boolean" },
    size: { control: "select", options: ["sm", "md", "lg", "xl", "full"] },
    placement: { control: "select", options: ["left", "right", "top", "bottom"] },
    isDismissable: { control: "boolean" },
  },
  args: { isOpen: true, size: "md", placement: "right", isDismissable: true },
}
export default meta
type Story = StoryObj

export const Default: Story = {
  render: (args) => {
    const el = document.createElement("ui-drawer")
    if (args.isOpen) el.setAttribute("is-open", "")
    el.setAttribute("size", args.size as string)
    el.setAttribute("placement", args.placement as string)
    if (args.isDismissable) el.setAttribute("is-dismissable", "")
    el.innerHTML = `
      <div slot="header" style="padding:1rem;border-bottom:1px solid #e4e4e7"><h3 style="font-weight:600">Drawer Title</h3></div>
      <div slot="body" style="padding:1rem"><p>Drawer content goes here.</p></div>
      <div slot="footer" style="padding:1rem;border-top:1px solid #e4e4e7;text-align:right"><button>Close</button></div>
    `
    return el
  },
}

export const Placements: Story = {
  render: () => {
    const div = document.createElement("div")
    div.style.cssText = "display:flex;gap:0.5rem"
    for (const p of ["left", "right", "top", "bottom"]) {
      const btn = document.createElement("button")
      btn.textContent = p
      btn.style.cssText = "padding:4px 12px;border:1px solid #e4e4e7;border-radius:6px;cursor:pointer"
      btn.addEventListener("click", () => {
        const el = document.createElement("ui-drawer")
        el.setAttribute("is-open", "")
        el.setAttribute("placement", p)
        el.innerHTML = `<div style="padding:1rem"><p>Drawer from ${p}</p></div>`
        document.body.appendChild(el)
      })
      div.appendChild(btn)
    }
    return div
  },
}
