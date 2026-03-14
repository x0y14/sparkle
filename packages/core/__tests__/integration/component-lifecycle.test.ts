import { describe, test, expect, vi } from "vitest"
import { defineElement } from "../../src/define-element.js"
import { useState } from "../../src/hooks/use-state.js"
import { useEffect } from "../../src/hooks/use-effect.js"
import { useRef } from "../../src/hooks/use-ref.js"
import { useMemo } from "../../src/hooks/use-memo.js"
import { renderToString } from "../../src/dsd/render-to-string.js"
import { createSharedSheet } from "../../src/styles/create-shared-sheet.js"

function flushMicrotasks(): Promise<void> {
  return new Promise((resolve) =>
    queueMicrotask(() => queueMicrotask(() => queueMicrotask(resolve))),
  )
}

let tagCounter = 0
function uniqueTag(): string {
  return `integ-el-${++tagCounter}-${Date.now()}`
}

describe("Integration: component lifecycle", () => {
  test("mount → render → prop change → update cycle", async () => {
    const tag = uniqueTag()
    const renders: string[] = []

    defineElement(
      {
        tag,
        props: { count: { type: Number } },
      },
      (props: any) => {
        renders.push(`render:${props.count ?? "undef"}`)
        return `<p>count: ${props.count ?? 0}</p>`
      },
    )

    const el = document.createElement(tag)
    document.body.appendChild(el)
    await flushMicrotasks()

    expect(renders.length).toBeGreaterThanOrEqual(1)

    el.setAttribute("count", "5")
    await flushMicrotasks()

    expect(el.shadowRoot!.innerHTML).toContain("5")
    document.body.removeChild(el)
  })

  test("useState counter: state update re-renders", async () => {
    const tag = uniqueTag()
    let setCount: ((v: number | ((p: number) => number)) => void) | null = null

    defineElement({ tag }, () => {
      const [count, _setCount] = useState(0)
      setCount = _setCount
      return `<span>${count}</span>`
    })

    const el = document.createElement(tag)
    document.body.appendChild(el)
    await flushMicrotasks()

    expect(el.shadowRoot!.innerHTML).toContain("0")

    setCount!(5)
    await flushMicrotasks()

    expect(el.shadowRoot!.innerHTML).toContain("5")
    document.body.removeChild(el)
  })

  test("useEffect: runs after mount, cleans up on unmount", async () => {
    const tag = uniqueTag()
    const mounted = vi.fn()
    const unmounted = vi.fn()

    defineElement({ tag }, () => {
      useEffect(() => {
        mounted()
        return () => unmounted()
      }, [])
      return "<p>effect test</p>"
    })

    const el = document.createElement(tag)
    document.body.appendChild(el)
    await flushMicrotasks()

    expect(mounted).toHaveBeenCalledTimes(1)
    expect(unmounted).not.toHaveBeenCalled()

    document.body.removeChild(el)
    // disconnectedCallback calls teardown which runs cleanup
    expect(unmounted).toHaveBeenCalledTimes(1)
  })

  test("multiple hooks combined correctly", async () => {
    const tag = uniqueTag()
    let setName: ((v: string) => void) | null = null

    defineElement({ tag }, () => {
      const [name, _setName] = useState("world")
      setName = _setName
      const ref = useRef(0)
      const greeting = useMemo(() => `Hello, ${name}!`, [name])

      ref.current++
      return `<p>${greeting} (render #${ref.current})</p>`
    })

    const el = document.createElement(tag)
    document.body.appendChild(el)
    await flushMicrotasks()

    expect(el.shadowRoot!.innerHTML).toContain("Hello, world!")

    setName!("sparkio")
    await flushMicrotasks()

    expect(el.shadowRoot!.innerHTML).toContain("Hello, sparkio!")
    document.body.removeChild(el)
  })

  test("DSD hydration preserves content", async () => {
    const tag = uniqueTag()
    defineElement({ tag }, () => "<p>client content</p>")

    // Verify SSR output format
    const Comp = customElements.get(tag)!
    const ssrHtml = renderToString(Comp, tag, {})
    expect(ssrHtml).toContain("shadowrootmode")
    expect(ssrHtml).toContain(`<${tag}`)
  })

  test("adoptedStyleSheets apply UnoCSS", async () => {
    const tag = uniqueTag()
    const sheet = createSharedSheet(".text-red { color: red; }")

    defineElement(
      {
        tag,
        styles: sheet,
      },
      () => '<p class="text-red">styled</p>',
    )

    const el = document.createElement(tag)
    document.body.appendChild(el)
    await flushMicrotasks()

    expect(el.shadowRoot!.adoptedStyleSheets).toContain(sheet)
    expect(el.shadowRoot!.innerHTML).toContain("text-red")
    document.body.removeChild(el)
  })
})
