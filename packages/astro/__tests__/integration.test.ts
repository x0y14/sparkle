import { describe, test, expect, vi } from "vitest"
import { sparkioIntegration } from "../src/index.js"

describe("sparkioIntegration", () => {
  test("returns valid AstroIntegration", () => {
    const integration = sparkioIntegration()
    expect(integration).toHaveProperty("name")
    expect(integration).toHaveProperty("hooks")
    expect(integration.hooks).toHaveProperty("astro:config:setup")
  })

  test("name is '@sparkio/astro'", () => {
    const integration = sparkioIntegration()
    expect(integration.name).toBe("@sparkio/astro")
  })

  test("addRenderer called with correct entrypoints", () => {
    const integration = sparkioIntegration()
    const addRenderer = vi.fn()
    const updateConfig = vi.fn()
    const injectScript = vi.fn()

    ;(integration.hooks as any)["astro:config:setup"]({
      addRenderer,
      updateConfig,
      injectScript,
    })

    expect(addRenderer).toHaveBeenCalledTimes(1)
    const rendererConfig = addRenderer.mock.calls[0][0]
    expect(rendererConfig.name).toBe("@sparkio/astro")
    expect(rendererConfig.serverEntrypoint).toContain("server")
    expect(rendererConfig.clientEntrypoint).toContain("client")
  })

  test("updateConfig adds Vite plugin", () => {
    const integration = sparkioIntegration()
    const addRenderer = vi.fn()
    const updateConfig = vi.fn()
    const injectScript = vi.fn()

    ;(integration.hooks as any)["astro:config:setup"]({
      addRenderer,
      updateConfig,
      injectScript,
    })

    expect(updateConfig).toHaveBeenCalledTimes(1)
    const config = updateConfig.mock.calls[0][0]
    expect(config.vite.plugins.length).toBeGreaterThan(0)
  })

  test("injects DSD polyfill by default", () => {
    const integration = sparkioIntegration()
    const addRenderer = vi.fn()
    const updateConfig = vi.fn()
    const injectScript = vi.fn()

    ;(integration.hooks as any)["astro:config:setup"]({
      addRenderer,
      updateConfig,
      injectScript,
    })

    expect(injectScript).toHaveBeenCalledTimes(1)
    expect(injectScript.mock.calls[0][0]).toBe("head-inline")
  })

  test("polyfill:false skips injection", () => {
    const integration = sparkioIntegration({ polyfill: false })
    const addRenderer = vi.fn()
    const updateConfig = vi.fn()
    const injectScript = vi.fn()

    ;(integration.hooks as any)["astro:config:setup"]({
      addRenderer,
      updateConfig,
      injectScript,
    })

    expect(injectScript).not.toHaveBeenCalled()
  })

  test("polyfill script runs immediately (no DOMContentLoaded)", () => {
    const integration = sparkioIntegration()
    const addRenderer = vi.fn()
    const updateConfig = vi.fn()
    const injectScript = vi.fn()

    ;(integration.hooks as any)["astro:config:setup"]({
      addRenderer,
      updateConfig,
      injectScript,
    })

    const script = injectScript.mock.calls[0][1] as string
    expect(script).not.toContain("DOMContentLoaded")
    expect(script).toContain("p(document)")
  })

  test("unoConfig が sparkioVitePlugin に渡される", () => {
    const fakeUnoConfig = { presets: [] }
    const integration = sparkioIntegration({ unoConfig: fakeUnoConfig })
    const addRenderer = vi.fn()
    const updateConfig = vi.fn()
    const injectScript = vi.fn()

    ;(integration.hooks as any)["astro:config:setup"]({
      addRenderer,
      updateConfig,
      injectScript,
    })

    const config = updateConfig.mock.calls[0][0]
    const plugin = config.vite.plugins[0]
    expect(plugin.name).toBe("sparkio:vite")
  })

  test("unoConfig 未指定でもエラーにならない", () => {
    const integration = sparkioIntegration()
    const addRenderer = vi.fn()
    const updateConfig = vi.fn()
    const injectScript = vi.fn()

    expect(() => {
      ;(integration.hooks as any)["astro:config:setup"]({
        addRenderer,
        updateConfig,
        injectScript,
      })
    }).not.toThrow()
  })

  test("polyfill script supports DSD attributes", () => {
    const integration = sparkioIntegration()
    const addRenderer = vi.fn()
    const updateConfig = vi.fn()
    const injectScript = vi.fn()

    ;(integration.hooks as any)["astro:config:setup"]({
      addRenderer,
      updateConfig,
      injectScript,
    })

    const script = injectScript.mock.calls[0][1] as string
    expect(script).toContain("shadowrootdelegatesfocus")
    expect(script).toContain("shadowrootclonable")
    expect(script).toContain("shadowrootserializable")
  })
})
