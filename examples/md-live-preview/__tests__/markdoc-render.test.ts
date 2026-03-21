import { describe, it, expect } from "vitest"
import Markdoc from "@markdoc/markdoc"

function render(source: string): string {
  const ast = Markdoc.parse(source)
  const content = Markdoc.transform(ast)
  return Markdoc.renderers.html(content)
}

describe("Markdoc rendering", () => {
  it("renders heading", () => {
    const html = render("# Hello")
    expect(html).toContain("<h1>")
    expect(html).toContain("Hello")
  })

  it("renders paragraph", () => {
    const html = render("Hello world")
    expect(html).toContain("<p>")
    expect(html).toContain("Hello world")
  })

  it("renders bold", () => {
    const html = render("**bold**")
    expect(html).toContain("<strong>")
    expect(html).toContain("bold")
  })

  it("renders unordered list", () => {
    const html = render("- item1\n- item2")
    expect(html).toContain("<ul>")
    expect(html).toContain("<li>")
    expect(html).toContain("item1")
    expect(html).toContain("item2")
  })

  it("renders code block", () => {
    const html = render("```\nconst x = 1\n```")
    expect(html).toContain("<pre>")
    expect(html).toContain("const x = 1")
  })

  it("handles empty input", () => {
    const html = render("")
    expect(html).toBeDefined()
  })
})
