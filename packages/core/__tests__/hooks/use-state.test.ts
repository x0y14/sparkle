import { describe, test, expect, beforeEach, vi } from "vitest"
import { setCurrent, clear, type HookContext } from "../../src/hooks/context.js"
import { useState } from "../../src/hooks/use-state.js"

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

describe("useState", () => {
  beforeEach(() => {
    clear()
  })

  test("returns initial value on first call", () => {
    const ctx = createTestContext()
    const [value] = renderWith(ctx, () => useState(42))
    expect(value).toBe(42)
  })

  test("initializer function is called only once", () => {
    const ctx = createTestContext()
    const init = vi.fn(() => 99)
    renderWith(ctx, () => useState(init))
    expect(init).toHaveBeenCalledTimes(1)

    // Second render
    renderWith(ctx, () => useState(init))
    expect(init).toHaveBeenCalledTimes(1)
  })

  test("setter triggers ctx.update()", () => {
    const ctx = createTestContext()
    const [, setter] = renderWith(ctx, () => useState(0))
    setter(1)
    expect(ctx.update).toHaveBeenCalledTimes(1)
  })

  test("setter with function updater receives previous value", () => {
    const ctx = createTestContext()
    let setter: (v: number | ((p: number) => number)) => void
    renderWith(ctx, () => {
      const [, s] = useState(10)
      setter = s
    })
    setter!((prev) => prev + 5)
    // Re-render to get new value
    const [value] = renderWith(ctx, () => useState(10))
    expect(value).toBe(15)
  })

  test("setter skips update when value unchanged (Object.is)", () => {
    const ctx = createTestContext()
    const [, setter] = renderWith(ctx, () => useState(42))
    setter(42)
    expect(ctx.update).not.toHaveBeenCalled()
  })

  test("NaN equality: Object.is(NaN, NaN) = true, skip update", () => {
    const ctx = createTestContext()
    const [, setter] = renderWith(ctx, () => useState(NaN))
    setter(NaN)
    expect(ctx.update).not.toHaveBeenCalled()
  })

  test("+0/-0 distinction: Object.is(+0, -0) = false, triggers update", () => {
    const ctx = createTestContext()
    const [, setter] = renderWith(ctx, () => useState(+0))
    setter(-0)
    expect(ctx.update).toHaveBeenCalledTimes(1)
  })

  test("multiple useState maintain independent state", () => {
    const ctx = createTestContext()
    const result = renderWith(ctx, () => {
      const [a] = useState("hello")
      const [b] = useState(42)
      return { a, b }
    })
    expect(result.a).toBe("hello")
    expect(result.b).toBe(42)
  })

  test("state persists across re-renders", () => {
    const ctx = createTestContext()
    let setter: (v: number | ((p: number) => number)) => void
    renderWith(ctx, () => {
      const [, s] = useState(0)
      setter = s
    })
    setter!(5)
    const [value] = renderWith(ctx, () => useState(0))
    expect(value).toBe(5)
  })

  test("setter does not call initializer on re-render", () => {
    const ctx = createTestContext()
    const init = vi.fn(() => 0)
    renderWith(ctx, () => useState(init))
    renderWith(ctx, () => useState(init))
    expect(init).toHaveBeenCalledTimes(1)
  })

  test("setter works correctly after context replacement (disconnect/reconnect)", () => {
    // 1st context (mount)
    const ctx1 = createTestContext()
    const [, setter] = renderWith(ctx1, () => useState(0))

    // Simulate disconnect/reconnect: create new context with same hooks
    const ctx2 = createTestContext({
      hooks: ctx1.hooks,
      host: ctx1.host,
    })

    // setter was captured with ctx1, but should still trigger update
    setter(5)

    // ctx1.update should have been called (since setter captures ctx1)
    expect(ctx1.update).toHaveBeenCalledTimes(1)

    // Verify state was updated
    const [value] = renderWith(ctx2, () => useState(0))
    expect(value).toBe(5)
  })
})
