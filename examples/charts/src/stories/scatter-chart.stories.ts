import type { Meta, StoryObj } from "@storybook/html"
import { createChart } from "../lib/index"

const meta: Meta = { title: "Charts/Scatter" }
export default meta
type Story = StoryObj

function createContainer(width = 600, height = 400): HTMLDivElement {
  const div = document.createElement("div")
  div.style.width = `${width}px`
  div.style.height = `${height}px`
  return div
}

function seededRandom(seed: number) {
  return () => { seed = (seed * 16807 + 0) % 2147483647; return seed / 2147483647 }
}

export const Default: Story = {
  render: () => {
    const container = createContainer()
    const rng = seededRandom(42)
    createChart(container, {
      type: "scatter",
      series: [{
        data: Array.from({ length: 200 }, () => ({ x: rng() * 100, y: rng() * 100 })),
        label: "Points",
        pointRadius: 4,
      }],
      title: "Scatter Plot",
    })
    return container
  },
}
