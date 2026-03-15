import type { Plugin } from "vite"
import { createGenerator, type UserConfig, type UnoGenerator } from "@unocss/core"

const CSS_PLACEHOLDER = "@unocss-placeholder"
const VIRTUAL_ID = "virtual:sparkio/uno.css"
const RESOLVED_VIRTUAL_ID = "\0virtual:sparkio/uno.css"

export type SparkioVitePluginOptions = {
  unoConfig?: UserConfig
  preflights?: boolean
  safelist?: boolean
}

async function resolveApply(code: string, uno: UnoGenerator): Promise<string> {
  const re = /@apply\s+['"]?([^;}"'\n]+)['"]?\s*;?/g
  const matches = [...code.matchAll(re)]
  if (matches.length === 0) return code
  let result = code
  for (const m of matches) {
    const classes = m[1].trim()
    const fakeHtml = `<div class="${classes}"></div>`
    const { css } = await uno.generate(fakeHtml, { preflights: false, safelist: false })
    // extract declarations from generated CSS rules
    const decls = [...css.matchAll(/\{([^}]+)\}/g)].map((d) => d[1].trim()).join(" ")
    result = result.replace(m[0], decls)
  }
  return result
}

export function sparkioVitePlugin(options?: SparkioVitePluginOptions): Plugin {
  let uno: UnoGenerator
  const preflights = options?.preflights ?? true
  const safelist = options?.safelist ?? true

  return {
    name: "sparkio:vite",
    enforce: "pre",

    async buildStart() {
      uno = await createGenerator(options?.unoConfig ?? {})
    },

    resolveId(id: string) {
      if (id === VIRTUAL_ID) return RESOLVED_VIRTUAL_ID
    },

    async load(id: string) {
      if (id !== RESOLVED_VIRTUAL_ID) return
      if (!uno) uno = await createGenerator(options?.unoConfig ?? {})
      const { css } = await uno.generate([], { preflights, safelist })
      const escaped = css.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$/g, "\\$")
      return {
        code: `const sheet = new CSSStyleSheet();\nsheet.replaceSync(\`${escaped}\`);\nexport default sheet;\n`,
        map: null,
      }
    },

    async transform(code: string, _id: string) {
      if (!code.includes(CSS_PLACEHOLDER)) return null
      if (!uno) uno = await createGenerator(options?.unoConfig ?? {})
      const { css } = await uno.generate(code, { preflights, safelist })
      const escaped = css.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$/g, "\\$")
      let result = code.replace(CSS_PLACEHOLDER, () => escaped)
      result = await resolveApply(result, uno)
      return {
        code: result,
        map: null,
      }
    },

    handleHotUpdate(ctx) {
      const read = ctx.read
      ctx.read = async () => {
        const code = await read()
        if (!code.includes(CSS_PLACEHOLDER)) return code
        if (!uno) uno = await createGenerator(options?.unoConfig ?? {})
        const { css } = await uno.generate(code, { preflights, safelist })
        const escaped = css.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$/g, "\\$")
        let processed = code.replace(CSS_PLACEHOLDER, escaped)
        processed = await resolveApply(processed, uno)
        return processed
      }
      // Return undefined to let Vite perform default HMR handling
      return
    },
  }
}
