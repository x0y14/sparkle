import type { Meta, StoryObj } from "@storybook/html"
import "./ui-tooltip"

const meta: Meta = {
  title: "Components/Overlays/Tooltip",
  component: "ui-tooltip",
  argTypes: {
    content: { control: "text" },
    placement: { control: "select", options: ["top", "bottom", "left", "right"] },
    delay: { control: "number" },
    color: { control: "select", options: ["default", "primary", "secondary", "success", "warning", "danger"] },
  },
  args: { content: "Tooltip text", placement: "top", delay: 500, color: "default" },
}
export default meta
type Story = StoryObj

export const Default: Story = {
  render: (args) => {
    const el = document.createElement("ui-tooltip")
    el.setAttribute("content", args.content as string)
    el.setAttribute("placement", args.placement as string)
    el.setAttribute("delay", String(args.delay))
    el.setAttribute("color", args.color as string)
    el.innerHTML = `<button style="padding:6px 16px;border:1px solid #e4e4e7;border-radius:8px;cursor:pointer">Hover me</button>`
    return el
  },
}

export const Placements: Story = {
  render: () => {
    const div = document.createElement("div")
    div.style.cssText = "display:flex;gap:2rem;padding:4rem;justify-content:center"
    for (const p of ["top", "bottom", "left", "right"]) {
      const el = document.createElement("ui-tooltip")
      el.setAttribute("content", `Tooltip ${p}`)
      el.setAttribute("placement", p)
      el.innerHTML = `<button style="padding:6px 16px;border:1px solid #e4e4e7;border-radius:8px;cursor:pointer">${p}</button>`
      div.appendChild(el)
    }
    return div
  },
}
