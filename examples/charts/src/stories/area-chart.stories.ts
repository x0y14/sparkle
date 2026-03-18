import type { Meta, StoryObj } from "@storybook/html"
import { createChart } from "../lib/index"

const meta: Meta = { title: "Charts/Area" }
export default meta
type Story = StoryObj

function createContainer(width = 600, height = 400): HTMLDivElement {
  const div = document.createElement("div")
  div.style.width = `${width}px`
  div.style.height = `${height}px`
  return div
}

export const Default: Story = {
  render: () => {
    const container = createContainer()
    createChart(container, {
      type: "area",
      series: [{
        data: Array.from({ length: 80 }, (_, i) => ({ x: i, y: Math.sin(i * 0.08) * 40 + 60 })),
        label: "Area",
      }],
      title: "Area Chart",
    })
    return container
  },
}
