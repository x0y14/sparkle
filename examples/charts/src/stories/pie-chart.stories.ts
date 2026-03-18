import type { Meta, StoryObj } from "@storybook/html"
import { createChart } from "../lib/index"

const meta: Meta = { title: "Charts/Pie" }
export default meta
type Story = StoryObj

function createContainer(width = 400, height = 400): HTMLDivElement {
  const div = document.createElement("div")
  div.style.width = `${width}px`
  div.style.height = `${height}px`
  return div
}

export const Default: Story = {
  render: () => {
    const container = createContainer()
    createChart(container, {
      type: "pie",
      series: [
        { data: [{ x: 0, y: 35 }], label: "Chrome" },
        { data: [{ x: 0, y: 25 }], label: "Safari" },
        { data: [{ x: 0, y: 20 }], label: "Firefox" },
        { data: [{ x: 0, y: 15 }], label: "Edge" },
        { data: [{ x: 0, y: 5 }], label: "Other" },
      ],
      title: "Browser Share",
    })
    return container
  },
}

export const Donut: Story = {
  render: () => {
    const container = createContainer()
    createChart(container, {
      type: "pie",
      series: [
        { data: [{ x: 0, y: 35 }], label: "Chrome", innerRadius: 0.5 },
        { data: [{ x: 0, y: 25 }], label: "Safari", innerRadius: 0.5 },
        { data: [{ x: 0, y: 20 }], label: "Firefox", innerRadius: 0.5 },
        { data: [{ x: 0, y: 15 }], label: "Edge", innerRadius: 0.5 },
        { data: [{ x: 0, y: 5 }], label: "Other", innerRadius: 0.5 },
      ],
      title: "Donut Chart",
    })
    return container
  },
}
