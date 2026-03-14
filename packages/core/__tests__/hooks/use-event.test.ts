import { describe, test, expect, beforeEach, vi } from "vitest";
import { setCurrent, clear, type HookContext } from "../../src/hooks/context.js";
import { useEvent } from "../../src/hooks/use-event.js";

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

describe("useEvent", () => {
  beforeEach(() => {
    clear();
  });

  test("returns dispatch function", () => {
    const ctx = createTestContext();
    const dispatch = renderWith(ctx, () => useEvent("my-event"));
    expect(typeof dispatch).toBe("function");
  });

  test("dispatch fires CustomEvent on host", () => {
    const host = document.createElement("div");
    const ctx = createTestContext({ host });
    const dispatch = renderWith(ctx, () => useEvent("my-event"));

    const handler = vi.fn();
    host.addEventListener("my-event", handler);
    dispatch(undefined as void);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  test("includes detail payload", () => {
    const host = document.createElement("div");
    const ctx = createTestContext({ host });
    const dispatch = renderWith(ctx, () => useEvent<{ msg: string }>("my-event"));

    let receivedDetail: any;
    host.addEventListener("my-event", ((e: CustomEvent) => {
      receivedDetail = e.detail;
    }) as EventListener);

    dispatch({ msg: "hello" });
    expect(receivedDetail).toEqual({ msg: "hello" });
  });

  test("respects bubbles/composed from init", () => {
    const host = document.createElement("div");
    const ctx = createTestContext({ host });
    const dispatch = renderWith(ctx, () =>
      useEvent("my-event", { bubbles: true, composed: true }),
    );

    let event: CustomEvent | null = null;
    host.addEventListener("my-event", ((e: CustomEvent) => {
      event = e;
    }) as EventListener);

    dispatch(undefined as void);
    expect(event!.bubbles).toBe(true);
    expect(event!.composed).toBe(true);
  });

  test("function reference is stable (memoized)", () => {
    const ctx = createTestContext();
    const fn1 = renderWith(ctx, () => useEvent("test"));
    const fn2 = renderWith(ctx, () => useEvent("test"));
    expect(fn1).toBe(fn2);
  });
});
