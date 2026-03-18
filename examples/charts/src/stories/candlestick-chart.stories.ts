import type { Meta, StoryObj } from "@storybook/html"
import { createChart } from "../lib/index"

const meta: Meta = { title: "Charts/Candlestick" }
export default meta
type Story = StoryObj

function createContainer(width = 800, height = 400): HTMLDivElement {
  const div = document.createElement("div")
  div.style.width = `${width}px`
  div.style.height = `${height}px`
  return div
}

function seededRandom(seed: number) {
  return () => { seed = (seed * 16807 + 0) % 2147483647; return seed / 2147483647 }
}

function generateOHLC(count: number) {
  const rng = seededRandom(123)
  let price = 100
  return Array.from({ length: count }, (_, i) => {
    const open = price
    const change = (rng() - 0.5) * 5
    const close = open + change
    const high = Math.max(open, close) + rng() * 3
    const low = Math.min(open, close) - rng() * 3
    price = close
    return { time: i * 86400000, open, high, low, close }
  })
}

export const Default: Story = {
  render: () => {
    const container = createContainer()
    createChart(container, {
      type: "candlestick",
      series: [{ data: generateOHLC(30), label: "OHLC" }],
      title: "Candlestick",
    })
    return container
  },
}
