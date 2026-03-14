import { describe, test, expect, beforeEach, vi } from "vitest"
import { setCurrent, clear, type HookContext } from "../../src/hooks/context.js"
import { useRef } from "../../src/hooks/use-ref.js"

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

describe("useRef", () => {
  beforeEach(() => {
    clear()
  })

  test("returns { current: initialValue }", () => {
    const ctx = createTestContext()
    const ref = renderWith(ctx, () => useRef(42))
    expect(ref).toEqual({ current: 42 })
  })

  test("returns same object reference across renders", () => {
    const ctx = createTestContext()
    const ref1 = renderWith(ctx, () => useRef(42))
    const ref2 = renderWith(ctx, () => useRef(42))
    expect(ref1).toBe(ref2)
  })

  test("current is mutable", () => {
    const ctx = createTestContext()
    const ref = renderWith(ctx, () => useRef(0))
    ref.current = 99
    expect(ref.current).toBe(99)
  })

  test("works with undefined initial", () => {
    const ctx = createTestContext()
    const ref = renderWith(ctx, () => useRef(undefined))
    expect(ref).toEqual({ current: undefined })
  })
})
