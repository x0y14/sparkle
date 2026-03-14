import { describe, test, expect, vi } from "vitest"
import { renderToString } from "../../src/dsd/render-to-string.js"
import { defineElement } from "../../src/define-element.js"

let tagCounter = 0
function uniqueTag(): string {
  return `ssr-el-${++tagCounter}-${Date.now()}`
}

describe("renderToString", () => {
  test("produces <template shadowrootmode='open'>", () => {
    const tag = uniqueTag()
    const Comp = defineElement({ tag }, () => "<p>hi</p>")
    const html = renderToString(Comp, tag, {})
    expect(html).toContain('shadowrootmode="open"')
    expect(html).toContain("<template")
  })

  test("wraps in custom element tag", () => {
    const tag = uniqueTag()
    const Comp = defineElement({ tag }, () => "<p>hi</p>")
    const html = renderToString(Comp, tag, {})
    expect(html).toContain(`<${tag}`)
    expect(html).toContain(`</${tag}>`)
  })

  test("includes <style> when unoCSSSheet provided", () => {
    const tag = uniqueTag()
    const Comp = defineElement({ tag }, () => "<p>styled</p>")
    const html = renderToString(Comp, tag, {}, { unoCSS: ".text-red { color: red; }" })
    expect(html).toContain("<style>")
    expect(html).toContain(".text-red { color: red; }")
  })

  test("renderFn runs in SSR mode (effects skipped)", () => {
    const tag = uniqueTag()
    const Comp = defineElement({ tag }, () => "<p>ssr</p>")
    const html = renderToString(Comp, tag, {})
    expect(html).toContain("<p>ssr</p>")
  })

  test("props rendered as attributes", () => {
    const tag = uniqueTag()
    const Comp = defineElement(
      {
        tag,
        props: { name: { type: String } },
      },
      (props: any) => `<p>${props.name}</p>`,
    )
    const html = renderToString(Comp, tag, { name: "world" })
    expect(html).toContain('name="world"')
  })

  test("boolean attributes: true=valueless, false=omitted", () => {
    const tag = uniqueTag()
    const Comp = defineElement(
      {
        tag,
        props: {
          disabled: { type: Boolean },
          hidden: { type: Boolean },
        },
      },
      () => "<p>hi</p>",
    )
    const html = renderToString(Comp, tag, { disabled: true, hidden: false })
    expect(html).toContain("disabled")
    expect(html).not.toContain("hidden")
  })

  test("HTML special chars are escaped in attributes", () => {
    const tag = uniqueTag()
    const Comp = defineElement(
      {
        tag,
        props: { name: { type: String } },
      },
      () => "<p>safe</p>",
    )
    const html = renderToString(Comp, tag, { name: '<b>"test"</b>' })
    // Attributes should be escaped
    expect(html).toContain("&lt;b&gt;")
    expect(html).toContain("&quot;")
  })

  test("slot content rendered outside template", () => {
    const tag = uniqueTag()
    const Comp = defineElement({ tag }, () => "<slot></slot>")
    const html = renderToString(Comp, tag, {}, { slotContent: "<span>child</span>" })
    // slot content should be between the host tags but outside <template>
    expect(html).toMatch(/<\/template><span>child<\/span>/)
  })

  test("returns empty inner when render returns null", () => {
    const tag = uniqueTag()
    const Comp = defineElement({ tag }, () => null)
    const html = renderToString(Comp, tag, {})
    expect(html).toContain(`<${tag}`)
    expect(html).toContain('shadowrootmode="open"')
  })

  test("object/array props serialized as JSON in attributes", () => {
    const tag = uniqueTag()
    const Comp = defineElement(
      {
        tag,
        props: { items: { type: Array } },
      },
      (props: any) => `<p>${JSON.stringify(props.items)}</p>`,
    )

    const html = renderToString(Comp, tag, { items: [1, 2, 3] })
    expect(html).toContain('items="[1,2,3]"')
  })

  test("component styles included in SSR output", () => {
    const tag = uniqueTag()
    const Comp = defineElement(
      {
        tag,
        styles: "p { color: red; }",
      },
      () => "<p>styled</p>",
    )

    const html = renderToString(Comp, tag, {})
    expect(html).toContain("<style>")
    expect(html).toContain("p { color: red; }")
  })

  test("component styles + unoCSS combined in single <style> tag", () => {
    const tag = uniqueTag()
    const Comp = defineElement(
      {
        tag,
        styles: "p { color: red; }",
      },
      () => "<p>styled</p>",
    )

    const html = renderToString(Comp, tag, {}, { unoCSS: ".flex { display: flex; }" })
    expect(html).toContain("p { color: red; }")
    expect(html).toContain(".flex { display: flex; }")
    const styleCount = (html.match(/<style>/g) || []).length
    expect(styleCount).toBe(1)
  })

  test("named slots rendered without extra wrapper (content passed through)", () => {
    const tag = uniqueTag()
    const Comp = defineElement({ tag }, () => '<slot name="header"></slot><slot></slot>')
    const html = renderToString(
      Comp,
      tag,
      {},
      {
        slots: { default: "<p>body</p>", header: '<h1 slot="header">Title</h1>' },
      },
    )
    expect(html).toContain("<p>body</p>")
    expect(html).toContain('<h1 slot="header">Title</h1>')
    // Must NOT wrap in <div slot="...">
    expect(html).not.toContain('<div slot="header">')
  })

  test("shadow:false produces no template wrapper (light DOM)", () => {
    const tag = uniqueTag()
    const Comp = defineElement({ tag, shadow: false }, () => "<p>light</p>")
    const html = renderToString(Comp, tag, {})
    expect(html).not.toContain("<template")
    expect(html).not.toContain("shadowrootmode")
    expect(html).toContain("<p>light</p>")
  })

  test("shadow:{mode:'closed'} produces shadowrootmode='closed'", () => {
    const tag = uniqueTag()
    const Comp = defineElement({ tag, shadow: { mode: "closed" } }, () => "<p>closed</p>")
    const html = renderToString(Comp, tag, {})
    expect(html).toContain('shadowrootmode="closed"')
  })

  test("default shadow produces shadowrootmode='open'", () => {
    const tag = uniqueTag()
    const Comp = defineElement({ tag }, () => "<p>open</p>")
    const html = renderToString(Comp, tag, {})
    expect(html).toContain('shadowrootmode="open"')
  })

  test("camelCase props are converted to kebab-case attributes", () => {
    const tag = uniqueTag()
    const Comp = defineElement(
      {
        tag,
        props: {
          firstName: { type: String },
          lastName: { type: String },
        },
      },
      (props: any) => `<p>${props.firstName} ${props.lastName}</p>`,
    )

    const html = renderToString(Comp, tag, { firstName: "John", lastName: "Doe" })
    expect(html).toContain('first-name="John"')
    expect(html).toContain('last-name="Doe"')
    expect(html).not.toContain("firstName=")
    expect(html).not.toContain("lastName=")
  })

  test("useProp works in SSR (does not throw)", () => {
    const tag = uniqueTag()
    const Comp = defineElement(
      {
        tag,
        props: { name: { type: String } },
      },
      (props: any) => {
        return `<p>${props.name ?? "default"}</p>`
      },
    )

    // props を渡して SSR
    const html = renderToString(Comp, tag, { name: "world" })
    expect(html).toContain("<p>world</p>")
  })

  test("SSR dummy host has props set for useProp compatibility", () => {
    const tag = uniqueTag()
    const Comp = defineElement(
      {
        tag,
        props: { title: { type: String } },
      },
      (props: any) => `<p>${props.title}</p>`,
    )

    // renderToString に props を渡した場合、ダミーホストにも設定されるべき
    expect(() => renderToString(Comp, tag, { title: "test" })).not.toThrow()
  })

  test("delegatesFocus serialized as DSD attribute", () => {
    const tag = uniqueTag()
    const Comp = defineElement(
      { tag, shadow: { mode: "open", delegatesFocus: true } },
      () => "<p>focus</p>",
    )
    const html = renderToString(Comp, tag, {})
    expect(html).toContain('shadowrootmode="open"')
    expect(html).toContain("shadowrootdelegatesfocus")
  })

  test("clonable and serializable DSD attributes", () => {
    const tag = uniqueTag()
    const shadow = { mode: "open" as const, clonable: true, serializable: true }
    const Comp = defineElement({ tag, shadow: shadow as any }, () => "<p>hi</p>")
    const html = renderToString(Comp, tag, {})
    expect(html).toContain("shadowrootclonable")
    expect(html).toContain("shadowrootserializable")
  })

  test("ShadowRootInit without extra attrs omits them", () => {
    const tag = uniqueTag()
    const Comp = defineElement({ tag, shadow: { mode: "closed" } }, () => "<p>closed</p>")
    const html = renderToString(Comp, tag, {})
    expect(html).toContain('shadowrootmode="closed"')
    expect(html).not.toContain("shadowrootdelegatesfocus")
    expect(html).not.toContain("shadowrootclonable")
    expect(html).not.toContain("shadowrootserializable")
  })

  test("SSR render error logs warning instead of silently swallowing", () => {
    const tag = uniqueTag()
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {})
    const Comp = defineElement({ tag }, () => {
      throw new Error("boom")
    })
    const html = renderToString(Comp, tag, {})
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("[sparkio] SSR render error"),
      expect.any(Error),
    )
    // Still produces valid HTML shell
    expect(html).toContain(`<${tag}`)
    expect(html).toContain(`</${tag}>`)
    warnSpy.mockRestore()
  })

  test("SSR coerces props same as CSR (Number)", () => {
    const Comp = defineElement(
      { props: { count: { type: Number } } },
      (props: any) => `<p>${typeof props.count}</p>`,
    )
    const html = renderToString(Comp, "test-coerce-num", { count: "42" })
    // SSR でも Number に coerce されるべき
    expect(html).toContain("number")
  })

  test("CSS containing </style> is escaped to prevent style tag breakout", () => {
    const tag = uniqueTag()
    const maliciousCss = '</style><script>alert("xss")</script><style>'
    const Comp = defineElement({ tag, styles: maliciousCss }, () => "<p>hi</p>")
    const html = renderToString(Comp, tag, {})
    // </style> がそのまま出力されると style タグが閉じてしまう
    expect(html).not.toContain("</style><script>")
    // エスケープされた形で含まれるべき
    expect(html).toContain("<\\/style>")
  })

  test("unoCSS containing </style> is also escaped", () => {
    const tag = uniqueTag()
    const Comp = defineElement({ tag }, () => "<p>hi</p>")
    const html = renderToString(
      Comp,
      tag,
      {},
      { unoCSS: 'a{content:"</style><script>alert(1)</script>"}' },
    )
    expect(html).not.toContain("</style><script>")
  })

  test("invalid tag name falls back to sparkio-component", () => {
    const Comp = defineElement({}, () => "<p>hi</p>")
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {})
    const html = renderToString(Comp, "div><script>alert(1)</script><div", {})
    expect(html).toContain("<sparkio-component")
    expect(html).toContain("</sparkio-component>")
    expect(html).not.toContain("<div><script>")
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("Invalid tag name"))
    warnSpy.mockRestore()
  })

  test("valid custom element tag name is accepted", () => {
    const tag = uniqueTag()
    const Comp = defineElement({ tag }, () => "<p>hi</p>")
    const html = renderToString(Comp, tag, {})
    expect(html).toContain(`<${tag}`)
    expect(html).toContain(`</${tag}>`)
  })

  test("attribute names with invalid characters are skipped", () => {
    const tag = uniqueTag()
    const Comp = defineElement({ tag }, () => "<p>hi</p>")
    const html = renderToString(Comp, tag, { 'x" onclick="alert(1)': "val" })
    expect(html).not.toContain("onclick")
    expect(html).not.toContain("alert")
  })

  test("SSR coerces props same as CSR (Boolean)", () => {
    const Comp = defineElement(
      { props: { active: { type: Boolean } } },
      (props: any) => `<p>${typeof props.active}</p>`,
    )
    const html = renderToString(Comp, "test-coerce-bool", { active: "" })
    // SSR でも Boolean に coerce されるべき
    expect(html).toContain("boolean")
  })
})
