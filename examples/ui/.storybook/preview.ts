import type { Preview } from "@storybook/html"
import "../src/index"

const preview: Preview = {
  parameters: {
    layout: "centered",
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    options: {
      storySort: {
        method: "alphabetical",
        order: ["Components"],
      },
    },
  },
}

export default preview
