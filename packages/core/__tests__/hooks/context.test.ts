import { describe, test, expect, beforeEach, vi } from "vitest"
import {
  setCurrent,
  clear,
  getCurrent,
  nextIndex,
  getHookState,
  runInContext,
  resetAll,
  type HookContext,
} from "../../src/hooks/context.js"

function createTestContext(overrides?: Partial<HookContext>): HookContext {
  return {
    host: document.createElement("div"),
    hooks: [],
    update: vi.fn(),
    ...overrides,
  }
}

describe("hooks/context", () => {
  beforeEach(() => {
    resetAll()
  })

  test("setCurrent sets the active hook context", () => {
    const ctx = createTestContext()
    setCurrent(ctx)
    expect(getCurrent()).toBe(ctx)
  })

  test("clear resets context to null", () => {
    const ctx = createTestContext()
    setCurrent(ctx)
    clear()
    expect(() => getCurrent()).toThrow("Hook called outside of component render")
  })

  test("nextIndex increments on each call", () => {
    const ctx = createTestContext()
    setCurrent(ctx)
    expect(nextIndex()).toBe(0)
    expect(nextIndex()).toBe(1)
    expect(nextIndex()).toBe(2)
  })

  test("nextIndex resets after clear", () => {
    const ctx = createTestContext()
    setCurrent(ctx)
    nextIndex()
    nextIndex()
    clear()
    setCurrent(ctx)
    expect(nextIndex()).toBe(0)
  })

  test("getCurrent throws outside render", () => {
    expect(() => getCurrent()).toThrow("Hook called outside of component render")
  })

  test("runInContext executes fn with context and clears after", () => {
    const ctx = createTestContext()
    const result = runInContext(ctx, () => {
      expect(getCurrent()).toBe(ctx)
      return 42
    })
    expect(result).toBe(42)
    expect(() => getCurrent()).toThrow()
  })

  test("runInContext clears context even on error", () => {
    const ctx = createTestContext()
    expect(() =>
      runInContext(ctx, () => {
        throw new Error("boom")
      }),
    ).toThrow("boom")
    expect(() => getCurrent()).toThrow()
  })

  test("nested runInContext restores outer context", () => {
    const outerCtx = createTestContext()
    const innerCtx = createTestContext()

    runInContext(outerCtx, () => {
      expect(getCurrent()).toBe(outerCtx)
      // Advance hook index in outer context
      const outerIdx = nextIndex() // 0
      expect(outerIdx).toBe(0)
      nextIndex() // 1

      // Nested runInContext should push/pop the stack
      const innerResult = runInContext(innerCtx, () => {
        expect(getCurrent()).toBe(innerCtx)
        expect(nextIndex()).toBe(0) // inner starts at 0
        return "inner"
      })
      expect(innerResult).toBe("inner")

      // After inner completes, outer context and hookIndex are restored
      expect(getCurrent()).toBe(outerCtx)
      expect(nextIndex()).toBe(2) // continues from where outer left off
    })

    // After everything, no context is active
    expect(() => getCurrent()).toThrow()
  })

  test("nested runInContext restores outer context even on inner error", () => {
    const outerCtx = createTestContext()
    const innerCtx = createTestContext()

    runInContext(outerCtx, () => {
      nextIndex() // advance to 1

      expect(() =>
        runInContext(innerCtx, () => {
          throw new Error("inner boom")
        }),
      ).toThrow("inner boom")

      // Outer context should still be active and hookIndex preserved
      expect(getCurrent()).toBe(outerCtx)
      expect(nextIndex()).toBe(1) // continues from 1
    })
  })

  test("getHookState initializes lazily at index", () => {
    const ctx = createTestContext()
    setCurrent(ctx)
    const state = getHookState(0)
    expect(state).toEqual({ value: undefined })
    expect(ctx.hooks.length).toBe(1)
  })
})
