import { describe, test, expect, beforeEach, vi } from "vitest";
import {
  setCurrent,
  clear,
  type HookContext,
} from "../../src/hooks/context.js";
import { useEffect } from "../../src/hooks/use-effect.js";
import { createScheduler, type RenderScheduler } from "../../src/hooks/scheduler.js";

function flushMicrotasks(): Promise<void> {
  return new Promise((resolve) =>
    queueMicrotask(() => queueMicrotask(() => queueMicrotask(resolve))),
  );
}

type TestEnv = {
  ctx: HookContext;
  scheduler: RenderScheduler;
};

function createTestEnv(renderFn?: () => void): TestEnv {
  const scheduler = createScheduler(renderFn ?? (() => {}));
  const ctx: HookContext = {
    host: document.createElement("div"),
    hooks: [],
    update: () => scheduler.scheduleUpdate(),
    _scheduler: scheduler,
  };
  return { ctx, scheduler };
}

function renderWith<T>(ctx: HookContext, fn: () => T): T {
  setCurrent(ctx);
  try {
    return fn();
  } finally {
    clear();
  }
}

describe("useEffect", () => {
  beforeEach(() => {
    clear();
  });

  test("callback is NOT called synchronously during render", () => {
    const { ctx } = createTestEnv();
    const callback = vi.fn();
    renderWith(ctx, () => useEffect(callback, []));
    expect(callback).not.toHaveBeenCalled();
  });

  test("callback runs after microtask", async () => {
    const callback = vi.fn();
    const { ctx, scheduler } = createTestEnv(() => {
      setCurrent(ctx);
      useEffect(callback, []);
      clear();
    });

    // Initial render to register effects
    renderWith(ctx, () => useEffect(callback, []));
    scheduler.scheduleUpdate();

    await flushMicrotasks();
    expect(callback).toHaveBeenCalled();
  });

  test("no deps: runs on every render", async () => {
    const callback = vi.fn();
    let renderCount = 0;
    const { ctx, scheduler } = createTestEnv(() => {
      renderCount++;
      setCurrent(ctx);
      useEffect(callback);
      clear();
    });

    scheduler.scheduleUpdate();
    await flushMicrotasks();

    scheduler.scheduleUpdate();
    await flushMicrotasks();

    expect(callback).toHaveBeenCalledTimes(2);
  });

  test("empty deps []: runs only once", async () => {
    const callback = vi.fn();
    const { ctx, scheduler } = createTestEnv(() => {
      setCurrent(ctx);
      useEffect(callback, []);
      clear();
    });

    scheduler.scheduleUpdate();
    await flushMicrotasks();

    scheduler.scheduleUpdate();
    await flushMicrotasks();

    expect(callback).toHaveBeenCalledTimes(1);
  });

  test("deps changed: re-runs", async () => {
    const callback = vi.fn();
    let dep = 1;
    const { ctx, scheduler } = createTestEnv(() => {
      setCurrent(ctx);
      useEffect(callback, [dep]);
      clear();
    });

    scheduler.scheduleUpdate();
    await flushMicrotasks();
    expect(callback).toHaveBeenCalledTimes(1);

    dep = 2;
    scheduler.scheduleUpdate();
    await flushMicrotasks();
    expect(callback).toHaveBeenCalledTimes(2);
  });

  test("deps unchanged: skips", async () => {
    const callback = vi.fn();
    const { ctx, scheduler } = createTestEnv(() => {
      setCurrent(ctx);
      useEffect(callback, [1]);
      clear();
    });

    scheduler.scheduleUpdate();
    await flushMicrotasks();

    scheduler.scheduleUpdate();
    await flushMicrotasks();

    expect(callback).toHaveBeenCalledTimes(1);
  });

  test("cleanup runs before re-invocation", async () => {
    const order: string[] = [];
    const cleanup = vi.fn(() => order.push("cleanup"));
    const callback = vi.fn(() => {
      order.push("effect");
      return cleanup;
    });
    let dep = 1;
    const { ctx, scheduler } = createTestEnv(() => {
      setCurrent(ctx);
      useEffect(callback, [dep]);
      clear();
    });

    scheduler.scheduleUpdate();
    await flushMicrotasks();

    dep = 2;
    scheduler.scheduleUpdate();
    await flushMicrotasks();

    expect(order).toEqual(["effect", "cleanup", "effect"]);
  });

  test("cleanup runs on teardown", async () => {
    const cleanup = vi.fn();
    const callback = vi.fn(() => cleanup);
    const { ctx, scheduler } = createTestEnv(() => {
      setCurrent(ctx);
      useEffect(callback, []);
      clear();
    });

    scheduler.scheduleUpdate();
    await flushMicrotasks();

    scheduler.teardown();
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  test("void return (no cleanup): no error", async () => {
    const callback = vi.fn(); // returns undefined
    const { ctx, scheduler } = createTestEnv(() => {
      setCurrent(ctx);
      useEffect(callback, []);
      clear();
    });

    scheduler.scheduleUpdate();
    await flushMicrotasks();

    // teardown should not throw
    expect(() => scheduler.teardown()).not.toThrow();
  });

  test("multiple effects maintain declaration order", async () => {
    const order: number[] = [];
    const { ctx, scheduler } = createTestEnv(() => {
      setCurrent(ctx);
      useEffect(() => { order.push(1); }, []);
      useEffect(() => { order.push(2); }, []);
      useEffect(() => { order.push(3); }, []);
      clear();
    });

    scheduler.scheduleUpdate();
    await flushMicrotasks();

    expect(order).toEqual([1, 2, 3]);
  });

  test("skipped in SSR context", () => {
    const callback = vi.fn();
    const ctx: HookContext = {
      host: document.createElement("div"),
      hooks: [],
      update: vi.fn(),
      isSSR: true,
    };
    renderWith(ctx, () => useEffect(callback, []));
    // Should not even register the effect
    expect(callback).not.toHaveBeenCalled();
  });

  test("effect re-runs after scheduler teardown and new scheduler creation (disconnect/reconnect)", async () => {
    const effectCalls: number[] = [];
    const callback = vi.fn(() => {
      effectCalls.push(1);
      return () => effectCalls.push(-1);
    });

    // 1st scheduler (mount)
    const { ctx: ctx1, scheduler: scheduler1 } = createTestEnv(() => {
      setCurrent(ctx1);
      useEffect(callback, []);
      clear();
    });

    scheduler1.scheduleUpdate();
    await flushMicrotasks();
    expect(effectCalls).toEqual([1]);
    effectCalls.length = 0;

    // Teardown (disconnect)
    scheduler1.teardown();
    expect(effectCalls).toEqual([-1]);
    effectCalls.length = 0;

    // 2nd scheduler (reconnect) - reuse hooks array
    const scheduler2 = createScheduler(() => {
      setCurrent(ctx2);
      useEffect(callback, []);
      clear();
    });
    const ctx2: HookContext = {
      host: ctx1.host,
      hooks: ctx1.hooks, // hooks 配列を保持
      update: () => scheduler2.scheduleUpdate(),
      _scheduler: scheduler2,
    };

    scheduler2.scheduleUpdate();
    await flushMicrotasks();

    // Effect should re-run after reconnect
    expect(effectCalls).toEqual([1]);
  });
});
