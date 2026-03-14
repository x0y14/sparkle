import { describe, test, expect, vi } from "vitest"
import sparkioRenderer from "../src/server.js"

describe("sparkio server renderer", () => {
  test("server check() identifies sparkio components", () => {
    const SparkioComp = class extends HTMLElement {
      static __sparkio = true
    }
    expect(sparkioRenderer.check(SparkioComp)).toBe(true)
  })

  test("server check() rejects non-sparkio", () => {
    expect(sparkioRenderer.check(class {})).toBe(false)
    expect(sparkioRenderer.check(null)).toBe(false)
    expect(sparkioRenderer.check(undefined)).toBe(false)
    expect(sparkioRenderer.check("string")).toBe(false)
    expect(sparkioRenderer.check(42)).toBe(false)
  })

  test("renderToStaticMarkup returns DSD HTML", async () => {
    const SparkioComp = class extends HTMLElement {
      static __sparkio = true
      static _renderFn = () => "<p>server rendered</p>"
    } as any

    // We need to register it to get a tag name
    const tag = `ssr-test-${Date.now()}`
    customElements.define(tag, SparkioComp)

    const result = await sparkioRenderer.renderToStaticMarkup(SparkioComp, { _tag: tag }, {})
    expect(result.html).toContain("shadowrootmode")
    expect(result.html).toContain("<p>server rendered</p>")
  })

  test("renderToStaticMarkup passes named slots without wrapper", async () => {
    const renderFn = vi.fn(() => '<slot name="header"></slot><slot></slot>')
    const SparkioComp = class extends HTMLElement {
      static __sparkio = true
      static _renderFn = renderFn
    } as any

    const tag = `ssr-slots-${Date.now()}`
    customElements.define(tag, SparkioComp)

    const result = await sparkioRenderer.renderToStaticMarkup(
      SparkioComp,
      { _tag: tag },
      { default: "<p>body</p>", header: '<h1 slot="header">Title</h1>' },
    )
    // Content passed through directly — no <div> wrapper
    expect(result.html).toContain('<h1 slot="header">Title</h1>')
    expect(result.html).not.toContain('<div slot="header">')
    expect(result.html).toContain("<p>body</p>")
  })

  test("props are forwarded", async () => {
    const renderFn = vi.fn((props: any) => `<p>${props.name}</p>`)
    const SparkioComp = class extends HTMLElement {
      static __sparkio = true
      static _renderFn = renderFn
    } as any

    const tag = `ssr-props-${Date.now()}`
    customElements.define(tag, SparkioComp)

    const result = await sparkioRenderer.renderToStaticMarkup(
      SparkioComp,
      { _tag: tag, name: "test" },
      {},
    )
    expect(result.html).toContain("test")
  })

  test("warns when using fallback tag name", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {})
    const Component = { __sparkio: true, _renderFn: () => "<p>hi</p>" }
    await sparkioRenderer.renderToStaticMarkup(Component, {}, {})
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("sparkio-component"))
    warnSpy.mockRestore()
  })
})
