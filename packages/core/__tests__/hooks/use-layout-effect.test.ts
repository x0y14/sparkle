import { describe, test, expect, beforeEach, vi } from "vitest";
import {
  setCurrent,
  clear,
  type HookContext,
} from "../../src/hooks/context.js";
import { useLayoutEffect } from "../../src/hooks/use-layout-effect.js";
import { useEffect } from "../../src/hooks/use-effect.js";
import { createScheduler, type RenderScheduler } from "../../src/hooks/scheduler.js";

function flushMicrotasks(): Promise<void> {
  return new Promise((resolve) =>
    queueMicrotask(() => queueMicrotask(() => queueMicrotask(resolve))),
  );
}

function createTestEnv(renderFn?: () => void): {
  ctx: HookContext;
  scheduler: RenderScheduler;
} {
  const scheduler = createScheduler(renderFn ?? (() => {}));
  const ctx: HookContext = {
    host: document.createElement("div"),
    hooks: [],
    update: () => scheduler.scheduleUpdate(),
    _scheduler: scheduler,
  };
  return { ctx, scheduler };
}

describe("useLayoutEffect", () => {
  beforeEach(() => {
    clear();
  });

  test("runs synchronously after commit (before effects)", async () => {
    const order: string[] = [];
    const { ctx, scheduler } = createTestEnv(() => {
      setCurrent(ctx);
      useLayoutEffect(() => {
        order.push("layout");
      }, []);
      useEffect(() => {
        order.push("effect");
      }, []);
      clear();
    });

    scheduler.scheduleUpdate();
    await flushMicrotasks();

    expect(order).toEqual(["layout", "effect"]);
  });

  test("cleanup before re-invocation", async () => {
    const order: string[] = [];
    let dep = 1;
    const { ctx, scheduler } = createTestEnv(() => {
      setCurrent(ctx);
      useLayoutEffect(() => {
        order.push("layout");
        return () => order.push("layout-cleanup");
      }, [dep]);
      clear();
    });

    scheduler.scheduleUpdate();
    await flushMicrotasks();

    dep = 2;
    scheduler.scheduleUpdate();
    await flushMicrotasks();

    expect(order).toEqual(["layout", "layout-cleanup", "layout"]);
  });

  test("deps comparison same as useEffect", async () => {
    const callback = vi.fn();
    const { ctx, scheduler } = createTestEnv(() => {
      setCurrent(ctx);
      useLayoutEffect(callback, [1]);
      clear();
    });

    scheduler.scheduleUpdate();
    await flushMicrotasks();

    scheduler.scheduleUpdate();
    await flushMicrotasks();

    // Same deps → only called once
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
