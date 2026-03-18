import type { Meta, StoryObj } from "@storybook/html"
import { createChart } from "../lib/index"

const meta: Meta = {
  title: "Charts/Line",
  argTypes: {
    pointCount: { control: "number" },
    lineWidth: { control: "number" },
    theme: { control: "select", options: ["light", "dark"] },
  },
  args: { pointCount: 50, lineWidth: 2, theme: "light" },
}
export default meta

type Story = StoryObj

function createContainer(width = 600, height = 400): HTMLDivElement {
  const div = document.createElement("div")
  div.style.width = `${width}px`
  div.style.height = `${height}px`
  return div
}

function sineData(n: number) {
  return Array.from({ length: n }, (_, i) => ({
    x: i, y: Math.sin(i * 0.1) * 50 + 100,
  }))
}

export const Default: Story = {
  render: (args) => {
    const container = createContainer()
    createChart(container, {
      type: "line",
      series: [{ data: sineData(args.pointCount as number), label: "Sine", lineWidth: args.lineWidth as number }],
      theme: args.theme as "light" | "dark",
      title: "Line Chart",
    })
    return container
  },
}

export const MultiSeries: Story = {
  render: () => {
    const container = createContainer()
    createChart(container, {
      type: "line",
      series: [
        { data: sineData(50), label: "Sine" },
        { data: Array.from({ length: 50 }, (_, i) => ({ x: i, y: Math.cos(i * 0.1) * 50 + 100 })), label: "Cosine" },
      ],
      title: "Multi Series",
    })
    return container
  },
}

export const DarkTheme: Story = {
  render: () => {
    const container = createContainer()
    createChart(container, {
      type: "line",
      series: [{ data: sineData(50), label: "Sine" }],
      theme: "dark",
      title: "Dark Theme",
    })
    return container
  },
}

export const NullGap: Story = {
  render: () => {
    const container = createContainer()
    const data = sineData(50)
    data[20] = { x: 20, y: NaN }
    data[21] = { x: 21, y: NaN }
    createChart(container, {
      type: "line",
      series: [{ data, label: "With Gap" }],
      title: "Null Gap",
    })
    return container
  },
}
