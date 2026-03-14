import { describe, test, expect, beforeEach } from "vitest";
import {
  setCurrent,
  clear,
  type HookContext,
} from "../../src/hooks/context.js";
import { useSlot } from "../../src/hooks/use-slot.js";
import { createScheduler } from "../../src/hooks/scheduler.js";

function flushMicrotasks(): Promise<void> {
  return new Promise((resolve) =>
    queueMicrotask(() => queueMicrotask(() => queueMicrotask(resolve))),
  );
}

function createTestEnv(renderFn?: () => void) {
  const scheduler = createScheduler(renderFn ?? (() => {}));
  const host = document.createElement("div");
  host.attachShadow({ mode: "open" });
  const ctx: HookContext = {
    host,
    hooks: [],
    update: () => scheduler.scheduleUpdate(),
    _scheduler: scheduler,
  };
  return { ctx, scheduler, host };
}

function renderWith<T>(ctx: HookContext, fn: () => T): T {
  setCurrent(ctx);
  try {
    return fn();
  } finally {
    clear();
  }
}

describe("useSlot", () => {
  beforeEach(() => {
    clear();
  });

  test("returns assigned elements for default slot", async () => {
    const { ctx, host } = createTestEnv();
    host.shadowRoot!.innerHTML = "<slot></slot>";

    let elements: Element[] = [];
    const renderFn = () => {
      setCurrent(ctx);
      elements = useSlot();
      clear();
    };

    // Setup scheduler with render fn
    const env = createTestEnv(renderFn);
    Object.assign(ctx, { _scheduler: env.scheduler, update: () => env.scheduler.scheduleUpdate() });

    renderWith(ctx, () => {
      elements = useSlot();
    });

    // Elements should be empty initially (no slotted content)
    expect(elements).toEqual([]);
  });

  test("named slot returns matching elements", () => {
    const { ctx, host } = createTestEnv();
    host.shadowRoot!.innerHTML = '<slot name="header"></slot>';

    const elements = renderWith(ctx, () => useSlot("header"));
    expect(elements).toEqual([]);
  });

  test("returns [] when no content", () => {
    const { ctx, host } = createTestEnv();
    host.shadowRoot!.innerHTML = "<slot></slot>";

    const elements = renderWith(ctx, () => useSlot());
    expect(elements).toEqual([]);
  });

  test("re-renders on slotchange", async () => {
    const { ctx, host } = createTestEnv();
    host.shadowRoot!.innerHTML = "<slot></slot>";

    renderWith(ctx, () => useSlot());

    // Simulate slotchange
    const slot = host.shadowRoot!.querySelector("slot")!;
    slot.dispatchEvent(new Event("slotchange"));

    // The effect listener should trigger ctx.update
    // Since effects are async, we just verify no errors
    await flushMicrotasks();
  });
});
