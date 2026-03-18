import type { StorybookConfig } from "@storybook/html-vite"
import { mergeConfig } from "vite"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const config: StorybookConfig = {
  stories: ["../src/stories/**/*.stories.ts"],
  addons: ["@storybook/addon-a11y", "@storybook/addon-docs"],
  framework: {
    name: "@storybook/html-vite",
    options: {},
  },
  core: {
    disableTelemetry: true,
  },
  async viteFinal(config) {
    const { sparkioVitePlugin } = await import(
      path.resolve(__dirname, "../../../packages/vite/dist/index.js")
    )
    const { default: unoConfig } = await import(
      path.resolve(__dirname, "../uno.config.ts")
    )
    return mergeConfig(config, {
      plugins: [sparkioVitePlugin({ unoConfig })],
    })
  },
}

export default config
