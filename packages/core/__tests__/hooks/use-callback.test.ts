import { describe, test, expect, beforeEach, vi } from "vitest";
import { setCurrent, clear, type HookContext } from "../../src/hooks/context.js";
import { useCallback } from "../../src/hooks/use-callback.js";

function createTestContext(overrides?: Partial<HookContext>): HookContext {
  return {
    host: document.createElement("div"),
    hooks: [],
    update: vi.fn(),
    ...overrides,
  };
}

function renderWith<T>(ctx: HookContext, fn: () => T): T {
  setCurrent(ctx);
  try {
    return fn();
  } finally {
    clear();
  }
}

describe("useCallback", () => {
  beforeEach(() => {
    clear();
  });

  test("returns same fn when deps unchanged", () => {
    const ctx = createTestContext();
    const fn = () => {};
    const cb1 = renderWith(ctx, () => useCallback(fn, [1]));
    const cb2 = renderWith(ctx, () => useCallback(fn, [1]));
    expect(cb1).toBe(cb2);
  });

  test("returns new fn when deps change", () => {
    const ctx = createTestContext();
    const fn1 = () => "a";
    const fn2 = () => "b";
    const cb1 = renderWith(ctx, () => useCallback(fn1, [1]));
    const cb2 = renderWith(ctx, () => useCallback(fn2, [2]));
    expect(cb1).not.toBe(cb2);
  });

  test("returned function is the original (not a wrapper)", () => {
    const ctx = createTestContext();
    const fn = () => "hello";
    const cb = renderWith(ctx, () => useCallback(fn, []));
    expect(cb).toBe(fn);
  });
});
