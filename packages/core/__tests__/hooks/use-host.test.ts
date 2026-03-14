import { describe, test, expect, beforeEach, vi } from "vitest"
import { setCurrent, clear, type HookContext } from "../../src/hooks/context.js"
import { useHost } from "../../src/hooks/use-host.js"

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

describe("useHost", () => {
  beforeEach(() => {
    clear()
  })

  test("returns { current: hostElement }", () => {
    const host = document.createElement("div")
    const ctx = createTestContext({ host })
    const ref = renderWith(ctx, () => useHost())
    expect(ref.current).toBe(host)
  })

  test("throws outside render context", () => {
    expect(() => useHost()).toThrow("Hook called outside of component render")
  })

  test("same ref across renders", () => {
    const ctx = createTestContext()
    const ref1 = renderWith(ctx, () => useHost())
    const ref2 = renderWith(ctx, () => useHost())
    expect(ref1).toBe(ref2)
  })
})
