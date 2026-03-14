import { describe, test, expect } from "vitest"
import { sparkioVitePlugin } from "../src/plugin.js"

describe("sparkioVitePlugin", () => {
  test("plugin name is 'sparkio:vite'", () => {
    const plugin = sparkioVitePlugin()
    expect(plugin.name).toBe("sparkio:vite")
  })

  test("enforce is 'pre'", () => {
    const plugin = sparkioVitePlugin()
    expect(plugin.enforce).toBe("pre")
  })

  test("transform: replaces @unocss-placeholder with generated CSS", async () => {
    const plugin = sparkioVitePlugin({
      unoConfig: { presets: [] },
    })
    await (plugin as any).buildStart?.()
    const transform = plugin.transform as Function
    const result = await transform("const css = `@unocss-placeholder`;", "test.ts")
    if (result) {
      expect(result.code).not.toContain("@unocss-placeholder")
    }
  })

  test("transform: no-op without placeholder", async () => {
    const plugin = sparkioVitePlugin()
    await (plugin as any).buildStart?.()
    const transform = plugin.transform as Function
    const result = await transform("const x = 1;", "test.ts")
    expect(result).toBeNull()
  })

  test("transform: lazy-inits uno if buildStart not called", async () => {
    const plugin = sparkioVitePlugin({ unoConfig: { presets: [] } })
    const transform = plugin.transform as Function
    const result = await transform("const css = `@unocss-placeholder`;", "test.ts")
    if (result) {
      expect(result.code).not.toContain("@unocss-placeholder")
    }
  })

  test("resolveId: recognizes virtual:sparkio/uno.css", () => {
    const plugin = sparkioVitePlugin()
    const resolveId = plugin.resolveId as Function
    const result = resolveId("virtual:sparkio/uno.css")
    expect(result).toBe("\0virtual:sparkio/uno.css")
  })

  test("resolveId: ignores other ids", () => {
    const plugin = sparkioVitePlugin()
    const resolveId = plugin.resolveId as Function
    const result = resolveId("./some-file.ts")
    expect(result).toBeUndefined()
  })

  test("load: virtual module returns CSSStyleSheet with replaceSync", async () => {
    const plugin = sparkioVitePlugin({
      unoConfig: { presets: [] },
    })
    await (plugin as any).buildStart?.()
    const load = plugin.load as Function
    const result = await load("\0virtual:sparkio/uno.css")
    expect(result).toContain("CSSStyleSheet")
    expect(result).toContain("replaceSync")
  })

  test("load: ignores other ids", async () => {
    const plugin = sparkioVitePlugin()
    const load = plugin.load as Function
    const result = await load("./some-file.ts")
    expect(result).toBeUndefined()
  })

  test("handleHotUpdate returns undefined (delegates to Vite default)", () => {
    const plugin = sparkioVitePlugin()
    const mockCtx = {
      read: async () => "some code",
      modules: [],
    }

    const result = (plugin as any).handleHotUpdate(mockCtx)
    expect(result).toBeUndefined()
  })

  test("transform: resolves @apply in CSS to utility declarations", async () => {
    const { presetUno } = await import("unocss")
    const plugin = sparkioVitePlugin({
      unoConfig: { presets: [presetUno()] },
    })
    await (plugin as any).buildStart?.()
    const transform = plugin.transform as Function
    const result = await transform(
      "const css = `@unocss-placeholder\n:host { @apply block; }`;",
      "test.ts",
    )
    expect(result).not.toBeNull()
    expect(result.code).not.toContain("@apply")
    expect(result.code).toContain("display:block")
  })

  test("transform: resolves @apply with multiple classes", async () => {
    const { presetUno } = await import("unocss")
    const plugin = sparkioVitePlugin({
      unoConfig: { presets: [presetUno()] },
    })
    await (plugin as any).buildStart?.()
    const transform = plugin.transform as Function
    const result = await transform(
      "const css = `@unocss-placeholder\n:host { @apply inline-flex items-center; }`;",
      "test.ts",
    )
    expect(result).not.toBeNull()
    expect(result.code).not.toContain("@apply")
    expect(result.code).toContain("display:inline-flex")
    expect(result.code).toContain("align-items:center")
  })

  test("transform: no @apply is no-op", async () => {
    const { presetUno } = await import("unocss")
    const plugin = sparkioVitePlugin({
      unoConfig: { presets: [presetUno()] },
    })
    await (plugin as any).buildStart?.()
    const transform = plugin.transform as Function
    const result = await transform(
      "const css = `@unocss-placeholder\n:host { display: block; }`;",
      "test.ts",
    )
    expect(result).not.toBeNull()
    expect(result.code).toContain(":host { display: block; }")
  })

  test("load: CSS containing ${ is escaped to prevent template literal injection", async () => {
    const plugin = sparkioVitePlugin({
      unoConfig: {
        presets: [],
        rules: [["inject", [["content", '"${alert(1)}"']]]],
      },
    })
    await (plugin as any).buildStart?.()
    const load = plugin.load as Function
    const result = await load("\0virtual:sparkio/uno.css")
    // ${ がエスケープされて \${ になっているべき
    expect(result).not.toMatch(/(?<!\\)\$\{/)
  })

  test("transform: CSS containing ${ is escaped in placeholder replacement", async () => {
    const plugin = sparkioVitePlugin({
      unoConfig: {
        presets: [],
        rules: [[/^inject-(.+)$/, ([, d]) => ({ content: `"\${${d}}"` })]],
      },
    })
    await (plugin as any).buildStart?.()
    const transform = plugin.transform as Function
    const code = 'const css = `@unocss-placeholder`;\n<div class="inject-alert(1)"></div>'
    const result = await transform(code, "test.ts")
    expect(result).not.toBeNull()
    expect(result.code).not.toMatch(/(?<!\\)\$\{/)
  })

  test("handleHotUpdate replaces CSS_PLACEHOLDER in ctx.read", async () => {
    const plugin = sparkioVitePlugin({ unoConfig: { presets: [] } })

    // buildStart を呼んで uno を初期化
    await (plugin as any).buildStart()

    const mockCtx = {
      read: async () => "const css = `@unocss-placeholder`;",
      modules: [],
    }

    ;(plugin as any).handleHotUpdate(mockCtx)

    const result = await mockCtx.read()
    expect(result).not.toContain("@unocss-placeholder")
  })
})
