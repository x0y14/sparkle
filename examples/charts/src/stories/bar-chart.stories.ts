import type { Meta, StoryObj } from "@storybook/html"
import { createChart } from "../lib/index"

const meta: Meta = { title: "Charts/Bar" }
export default meta
type Story = StoryObj

function createContainer(width = 600, height = 400): HTMLDivElement {
  const div = document.createElement("div")
  div.style.width = `${width}px`
  div.style.height = `${height}px`
  return div
}

export const Clustered: Story = {
  render: () => {
    const container = createContainer()
    createChart(container, {
      type: "bar",
      series: [
        { data: [{ x: 0, y: 30 }, { x: 1, y: 50 }, { x: 2, y: 20 }, { x: 3, y: 45 }], label: "2024" },
        { data: [{ x: 0, y: 40 }, { x: 1, y: 35 }, { x: 2, y: 55 }, { x: 3, y: 30 }], label: "2025" },
      ],
      title: "Clustered Bar",
    })
    return container
  },
}

export const Stacked: Story = {
  render: () => {
    const container = createContainer()
    createChart(container, {
      type: "bar",
      series: [
        { data: [{ x: 0, y: 30 }, { x: 1, y: 50 }, { x: 2, y: 20 }], label: "A", stackId: "s1" },
        { data: [{ x: 0, y: 20 }, { x: 1, y: 30 }, { x: 2, y: 40 }], label: "B", stackId: "s1" },
      ],
      title: "Stacked Bar",
    })
    return container
  },
}
