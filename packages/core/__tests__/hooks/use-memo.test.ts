import { describe, test, expect, beforeEach, vi } from "vitest"
import { setCurrent, clear, type HookContext } from "../../src/hooks/context.js"
import { useMemo } from "../../src/hooks/use-memo.js"

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

describe("useMemo", () => {
  beforeEach(() => {
    clear()
  })

  test("computes value on first render", () => {
    const ctx = createTestContext()
    const factory = vi.fn(() => 42)
    const value = renderWith(ctx, () => useMemo(factory, [1]))
    expect(value).toBe(42)
    expect(factory).toHaveBeenCalledTimes(1)
  })

  test("returns cached value when deps unchanged", () => {
    const ctx = createTestContext()
    const factory = vi.fn(() => ({ id: 1 }))
    const val1 = renderWith(ctx, () => useMemo(factory, [1, 2]))
    const val2 = renderWith(ctx, () => useMemo(factory, [1, 2]))
    expect(val1).toBe(val2)
    expect(factory).toHaveBeenCalledTimes(1)
  })

  test("recomputes when deps change", () => {
    const ctx = createTestContext()
    let dep = 1
    const factory = vi.fn(() => dep * 10)
    renderWith(ctx, () => useMemo(factory, [dep]))
    dep = 2
    const val = renderWith(ctx, () => useMemo(factory, [dep]))
    expect(val).toBe(20)
    expect(factory).toHaveBeenCalledTimes(2)
  })

  test("uses Object.is for dep comparison (NaN, +0/-0)", () => {
    const ctx = createTestContext()
    const factory = vi.fn(() => "result")

    // NaN === NaN with Object.is
    renderWith(ctx, () => useMemo(factory, [NaN]))
    renderWith(ctx, () => useMemo(factory, [NaN]))
    expect(factory).toHaveBeenCalledTimes(1)

    // +0 !== -0 with Object.is
    const ctx2 = createTestContext()
    const factory2 = vi.fn(() => "result")
    renderWith(ctx2, () => useMemo(factory2, [+0]))
    renderWith(ctx2, () => useMemo(factory2, [-0]))
    expect(factory2).toHaveBeenCalledTimes(2)
  })

  test("empty deps array: never recomputes", () => {
    const ctx = createTestContext()
    const factory = vi.fn(() => Math.random())
    const val1 = renderWith(ctx, () => useMemo(factory, []))
    const val2 = renderWith(ctx, () => useMemo(factory, []))
    expect(val1).toBe(val2)
    expect(factory).toHaveBeenCalledTimes(1)
  })
})
