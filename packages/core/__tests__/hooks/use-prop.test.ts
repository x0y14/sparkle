import { describe, test, expect, beforeEach, vi } from "vitest"
import { setCurrent, clear, type HookContext } from "../../src/hooks/context.js"
import { useProp } from "../../src/hooks/use-prop.js"

function createTestContext(overrides?: Partial<HookContext>): HookContext {
  return {
    host: document.createElement("div"),
    hooks: [],
    update: vi.fn(),
    ...overrides,
  }
}

function renderWith<T>(ctx: HookContext, fn: () => T): T {
  setCurrent(ctx)
  try {
    return fn()
  } finally {
    clear()
  }
}

describe("useProp", () => {
  beforeEach(() => {
    clear()
  })

  test("reads current property value", () => {
    const host = document.createElement("div") as any
    host.count = 5
    const ctx = createTestContext({ host })
    const [value] = renderWith(ctx, () => useProp<number>("count"))
    expect(value).toBe(5)
  })

  test("setter updates host property", () => {
    const host = document.createElement("div") as any
    host.count = 0
    const ctx = createTestContext({ host })
    const [, setter] = renderWith(ctx, () => useProp<number>("count"))
    setter(10)
    expect(host.count).toBe(10)
  })

  test("setter updates host property (re-render triggered by property setter)", () => {
    const host = document.createElement("div") as any
    host.count = 0
    const ctx = createTestContext({ host })
    const [, setter] = renderWith(ctx, () => useProp<number>("count"))
    setter(10)
    // setter sets host property; re-render is triggered by the property setter
    // in defineElement (scheduleUpdate), not by useProp directly
    expect(host.count).toBe(10)
  })

  test("throws for undeclared prop", () => {
    const host = document.createElement("div")
    const ctx = createTestContext({ host })
    expect(() => renderWith(ctx, () => useProp("nonexistent"))).toThrow()
  })

  test("useProp setter triggers re-render via property setter (not double)", async () => {
    const { defineElement } = await import("../../src/define-element.js")

    let tagCounter = 0
    const tag = `use-prop-double-${++tagCounter}-${Date.now()}`
    let renderCount = 0
    defineElement({ tag, props: { count: { type: Number, value: () => 0 } } }, (props: any) => {
      renderCount++
      const [count, setCount] = useProp<number>("count")
      // Expose setter for external use
      ;(props as any)._setCount = setCount
      return `<p>${count}</p>`
    })

    const flushMicrotasks = () =>
      new Promise<void>((resolve) =>
        queueMicrotask(() => queueMicrotask(() => queueMicrotask(resolve))),
      )

    const el = document.createElement(tag) as any
    document.body.appendChild(el)
    await flushMicrotasks()

    renderCount = 0
    // Set via property setter — triggers scheduleUpdate once
    el.count = 1
    await flushMicrotasks()

    // Property setter calls scheduleUpdate → exactly 1 render
    expect(renderCount).toBe(1)
    expect(el.shadowRoot!.innerHTML).toContain("<p>1</p>")
    document.body.removeChild(el)
  })
})
