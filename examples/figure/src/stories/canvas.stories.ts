import type { Meta, StoryObj } from "@storybook/html"

const meta: Meta = {
  title: "Figure/Canvas",
  argTypes: {
    rectCount: { control: "number" },
  },
  args: { rectCount: 3 },
}
export default meta

type Story = StoryObj

function createContainer(width = 600, height = 400): HTMLDivElement {
  const div = document.createElement("div")
  div.style.width = `${width}px`
  div.style.height = `${height}px`
  div.style.position = "relative"
  div.style.background = "#1a1a2e"
  return div
}

export const EmptyCanvas: Story = {
  render: () => {
    const container = createContainer()
    const canvas = document.createElement("figure-canvas")
    ;(canvas as HTMLElement).style.cssText = "position:absolute;inset:0"
    container.appendChild(canvas)
    return container
  },
}

export const WithRectangles: Story = {
  render: (args) => {
    const container = createContainer()
    const canvas = document.createElement("figure-canvas")
    ;(canvas as HTMLElement).style.cssText = "position:absolute;inset:0"
    container.appendChild(canvas)
    setTimeout(() => {
      for (let i = 0; i < (args.rectCount as number); i++) {
        window.dispatchEvent(new CustomEvent("figure:add-rect"))
      }
    }, 500)
    return container
  },
}
