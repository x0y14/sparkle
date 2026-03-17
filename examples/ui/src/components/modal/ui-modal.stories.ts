import type { Meta, StoryObj } from "@storybook/html"
import "./ui-modal"

const meta: Meta = {
  title: "Components/Overlays/Modal",
  component: "ui-modal",
  argTypes: {
    isOpen: { control: "boolean" },
    size: { control: "select", options: ["sm", "md", "lg", "xl", "full"] },
    placement: { control: "select", options: ["center", "top", "bottom"] },
    backdrop: { control: "select", options: ["opaque", "blur", "transparent"] },
    isDismissable: { control: "boolean" },
  },
  args: { isOpen: true, size: "md", placement: "center", backdrop: "opaque", isDismissable: true },
}
export default meta
type Story = StoryObj

export const Default: Story = {
  render: (args) => {
    const el = document.createElement("ui-modal")
    if (args.isOpen) el.setAttribute("is-open", "")
    el.setAttribute("size", args.size as string)
    el.setAttribute("placement", args.placement as string)
    el.setAttribute("backdrop", args.backdrop as string)
    if (args.isDismissable) el.setAttribute("is-dismissable", "")
    el.innerHTML = `
      <div slot="header" style="padding:1rem;border-bottom:1px solid #e4e4e7"><h3 style="font-weight:600">Modal Title</h3></div>
      <div slot="body" style="padding:1rem"><p>Modal content goes here.</p></div>
      <div slot="footer" style="padding:1rem;border-top:1px solid #e4e4e7;text-align:right"><button>Close</button></div>
    `
    return el
  },
}

export const Sizes: Story = {
  render: () => {
    const div = document.createElement("div")
    div.style.cssText = "display:flex;flex-direction:column;gap:1rem"
    for (const s of ["sm", "md", "lg", "xl"]) {
      const el = document.createElement("ui-modal")
      el.setAttribute("is-open", "")
      el.setAttribute("size", s)
      el.style.position = "relative"
      el.innerHTML = `<div style="padding:1rem"><p>Size: ${s}</p></div>`
      div.appendChild(el)
    }
    return div
  },
}
