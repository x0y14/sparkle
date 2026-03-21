import Markdoc from "@markdoc/markdoc"

export function computeLineOffsets(source: string): number[] {
  const offsets = [0]
  for (let i = 0; i < source.length; i++) {
    if (source[i] === "\n") offsets.push(i + 1)
  }
  return offsets
}

function walkInlineNodes(
  source: string,
  cursor: number,
  nodes: any[],
): number {
  for (const node of nodes) {
    switch (node.type) {
      case "text": {
        const content: string = node.attributes?.content ?? ""
        const idx = source.indexOf(content, cursor)
        if (idx >= 0) cursor = idx + content.length
        break
      }
      case "softbreak":
        cursor = source.indexOf("\n", cursor)
        if (cursor >= 0) cursor++
        break
      case "hardbreak":
        while (cursor < source.length && source[cursor] !== "\n") cursor++
        if (cursor < source.length) cursor++
        break
      case "strong":
      case "em":
      case "s": {
        const marker: string =
          node.attributes?.marker ??
          (node.type === "s"
            ? "~~"
            : node.type === "strong"
              ? "**"
              : "*")
        const start = cursor
        cursor += marker.length
        cursor = walkInlineNodes(source, cursor, node.children ?? [])
        cursor += marker.length
        node.__offsetStart = start
        node.__offsetEnd = cursor
        break
      }
      case "code": {
        const start = cursor
        let backticks = 0
        while (
          cursor + backticks < source.length &&
          source[cursor + backticks] === "`"
        )
          backticks++
        if (backticks === 0) backticks = 1
        cursor += backticks
        const content: string = node.attributes?.content ?? ""
        const idx = source.indexOf(content, cursor)
        if (idx >= 0) cursor = idx + content.length
        while (cursor < source.length && source[cursor] === " ") cursor++
        cursor += backticks
        node.__offsetStart = start
        node.__offsetEnd = cursor
        break
      }
      case "link": {
        const start = cursor
        cursor++ // [
        cursor = walkInlineNodes(source, cursor, node.children ?? [])
        cursor++ // ]
        cursor++ // (
        const href: string = node.attributes?.href ?? ""
        cursor += href.length
        if (node.attributes?.title) {
          cursor++ // space
          cursor++ // "
          cursor += (node.attributes.title as string).length
          cursor++ // "
        }
        cursor++ // )
        node.__offsetStart = start
        node.__offsetEnd = cursor
        break
      }
      case "image": {
        const start = cursor
        cursor += 2 // ![
        const alt: string = node.attributes?.alt ?? ""
        cursor += alt.length
        cursor++ // ]
        cursor++ // (
        const src: string = node.attributes?.src ?? ""
        cursor += src.length
        if (node.attributes?.title) {
          cursor++ // space
          cursor++ // "
          cursor += (node.attributes.title as string).length
          cursor++ // "
        }
        cursor++ // )
        node.__offsetStart = start
        node.__offsetEnd = cursor
        break
      }
    }
  }
  return cursor
}

function annotateOffsets(
  ast: any,
  source: string,
  lineOffsets: number[],
  sourceLength: number,
): void {
  function walkBlock(node: any) {
    if (node.lines && node.lines.length >= 2) {
      const start = lineOffsets[node.lines[0]] ?? 0
      const end = lineOffsets[node.lines[1]] ?? sourceLength
      node.__offsetStart = start
      node.__offsetEnd = end
    }
    for (const child of node.children ?? []) {
      if (child.type === "inline") {
        const blockStart = lineOffsets[node.lines?.[0] ?? 0] ?? 0
        walkInlineNodes(source, blockStart, child.children ?? [])
      } else {
        walkBlock(child)
      }
    }
  }
  walkBlock(ast)
}

function offsetAttrs(node: any): Record<string, string> {
  if (node.__offsetStart == null || node.__offsetEnd == null) return {}
  return {
    "data-offset-start": String(node.__offsetStart),
    "data-offset-end": String(node.__offsetEnd),
  }
}

function makeTransform(
  tagName: string | ((node: any) => string),
  attrMapper?: (node: any) => Record<string, any>,
) {
  return (node: any, config: any) => {
    const tag = typeof tagName === "function" ? tagName(node) : tagName
    const standardAttrs = attrMapper ? attrMapper(node) : {}
    const attrs = { ...standardAttrs, ...offsetAttrs(node) }
    return new Markdoc.Tag(tag, attrs, node.transformChildren(config))
  }
}

export function createMarkdocConfig() {
  const mt = (
    tag: string | ((n: any) => string),
    attrMapper?: (n: any) => Record<string, any>,
  ) => makeTransform(tag, attrMapper)

  return {
    nodes: {
      heading: {
        children: ["inline"],
        attributes: { level: { type: Number, required: true } },
        transform: mt((n) => `h${n.attributes.level}`),
      },
      paragraph: { transform: mt("p") },
      blockquote: { transform: mt("blockquote") },
      hr: {
        transform(node: any) {
          return new Markdoc.Tag("hr", offsetAttrs(node), [])
        },
      },
      list: {
        children: ["item"],
        attributes: { ordered: { type: Boolean } },
        transform: mt((n) => (n.attributes.ordered ? "ol" : "ul")),
      },
      item: { transform: mt("li") },
      fence: {
        attributes: {
          language: { type: String },
          content: { type: String },
        },
        transform(node: any) {
          const codeAttrs: Record<string, any> = {}
          if (node.attributes.language) {
            codeAttrs.class = `language-${node.attributes.language}`
          }
          const code = new Markdoc.Tag("code", codeAttrs, [
            node.attributes.content,
          ])
          return new Markdoc.Tag("pre", offsetAttrs(node), [code])
        },
      },
      table: { transform: mt("table") },
      thead: { transform: mt("thead") },
      tbody: { transform: mt("tbody") },
      tr: { transform: mt("tr") },
      td: { transform: mt("td") },
      th: { transform: mt("th") },
      strong: { transform: mt("strong") },
      em: { transform: mt("em") },
      s: { transform: mt("s") },
      code: {
        transform(node: any) {
          return new Markdoc.Tag(
            "code",
            offsetAttrs(node),
            [node.attributes?.content ?? ""],
          )
        },
      },
      link: {
        attributes: { href: { type: String }, title: { type: String } },
        transform: mt("a", (n) => {
          const a: Record<string, any> = { href: n.attributes.href }
          if (n.attributes.title) a.title = n.attributes.title
          return a
        }),
      },
      image: {
        attributes: { src: { type: String }, alt: { type: String } },
        transform(node: any) {
          return new Markdoc.Tag(
            "img",
            {
              src: node.attributes.src,
              alt: node.attributes.alt,
              ...offsetAttrs(node),
            },
            [],
          )
        },
      },
    },
  }
}

export function renderWithLocations(source: string): string {
  const lineOffsets = computeLineOffsets(source)
  const ast = Markdoc.parse(source, { location: true })
  annotateOffsets(ast, source, lineOffsets, source.length)
  const config = createMarkdocConfig()
  const content = Markdoc.transform(ast, config)
  return Markdoc.renderers.html(content)
}

export function findClickOffset(element: Element): number | null {
  let el: Element | null = element
  while (el) {
    const end = el.getAttribute("data-offset-end")
    if (end != null) return Number(end)
    el = el.parentElement
  }
  return null
}

const HIGHLIGHT_CLASS = "highlight-active"

export function applyHighlight(
  previewHost: HTMLElement,
  offset: number,
): void {
  const root = previewHost.shadowRoot
  if (!root) return

  for (const el of root.querySelectorAll(`.${HIGHLIGHT_CLASS}`)) {
    el.classList.remove(HIGHLIGHT_CLASS)
  }
  for (const el of root.querySelectorAll(".highlight-hover")) {
    el.classList.remove("highlight-hover")
  }

  const candidates = root.querySelectorAll("[data-offset-start]")
  let best: Element | null = null
  let bestRange = Infinity

  for (const el of candidates) {
    const start = Number(el.getAttribute("data-offset-start"))
    const end = Number(el.getAttribute("data-offset-end"))
    if (Number.isNaN(start) || Number.isNaN(end)) continue
    if (offset >= start && offset <= end) {
      const range = end - start
      if (range < bestRange) {
        bestRange = range
        best = el
      }
    }
  }

  if (best) best.classList.add(HIGHLIGHT_CLASS)
}
