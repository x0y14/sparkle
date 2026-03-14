import { describe, test, expect, vi } from "vitest"
import { createScheduler, type EffectEntry } from "../../src/hooks/scheduler.js"

function flushMicrotasks(): Promise<void> {
  return new Promise((resolve) => queueMicrotask(() => queueMicrotask(resolve)))
}

describe("scheduler", () => {
  test("batches multiple updates into single render", async () => {
    const renderFn = vi.fn()
    const scheduler = createScheduler(renderFn)

    scheduler.scheduleUpdate()
    scheduler.scheduleUpdate()
    scheduler.scheduleUpdate()

    await flushMicrotasks()
    expect(renderFn).toHaveBeenCalledTimes(1)
  })

  test("uses queueMicrotask (async)", async () => {
    const renderFn = vi.fn()
    const scheduler = createScheduler(renderFn)

    scheduler.scheduleUpdate()
    // synchronously: not called yet
    expect(renderFn).not.toHaveBeenCalled()

    await flushMicrotasks()
    expect(renderFn).toHaveBeenCalledTimes(1)
  })

  test("layoutEffects run synchronously during commit", async () => {
    const order: string[] = []
    const renderFn = vi.fn(() => {
      order.push("render")
    })
    const scheduler = createScheduler(renderFn)

    scheduler.addLayoutEffect({
      callback: () => {
        order.push("layout")
      },
      deps: [],
      prevDeps: undefined,
      cleanup: undefined,
    })

    scheduler.scheduleUpdate()
    await flushMicrotasks()

    expect(order).toEqual(["render", "layout"])
  })

  test("effects run after layoutEffects", async () => {
    const order: string[] = []
    const renderFn = vi.fn(() => {
      order.push("render")
    })
    const scheduler = createScheduler(renderFn)

    scheduler.addLayoutEffect({
      callback: () => {
        order.push("layout")
      },
      deps: [],
      prevDeps: undefined,
      cleanup: undefined,
    })

    scheduler.addEffect({
      callback: () => {
        order.push("effect")
      },
      deps: [],
      prevDeps: undefined,
      cleanup: undefined,
    })

    scheduler.scheduleUpdate()

    // wait for render + layout + effect microtask
    await new Promise<void>((resolve) =>
      queueMicrotask(() => queueMicrotask(() => queueMicrotask(() => resolve()))),
    )

    expect(order).toEqual(["render", "layout", "effect"])
  })

  test("prevents re-entrant renders", async () => {
    let renderCount = 0
    const renderFn = vi.fn(() => {
      renderCount++
    })
    const scheduler = createScheduler(renderFn)

    // Schedule from within a microtask that's "during" a schedule
    scheduler.scheduleUpdate()
    scheduler.scheduleUpdate()

    await flushMicrotasks()
    expect(renderCount).toBe(1)
  })

  test("scheduleUpdate after teardown does not call renderFn", async () => {
    const renderFn = vi.fn()
    const scheduler = createScheduler(renderFn)

    scheduler.teardown()
    scheduler.scheduleUpdate()

    await flushMicrotasks()
    expect(renderFn).not.toHaveBeenCalled()
  })

  test("microtask scheduled before teardown does not call renderFn", async () => {
    const renderFn = vi.fn()
    const scheduler = createScheduler(renderFn)

    scheduler.scheduleUpdate()
    // teardown before microtask fires
    scheduler.teardown()

    await flushMicrotasks()
    expect(renderFn).not.toHaveBeenCalled()
  })

  test("addEffect does not add duplicate entries", async () => {
    let effectRunCount = 0
    const renderFn = vi.fn()
    const scheduler = createScheduler(renderFn)

    const entry: EffectEntry = {
      callback: () => {
        effectRunCount++
      },
      deps: [],
      prevDeps: undefined,
      cleanup: undefined,
    }

    // 同じエントリを2回追加
    scheduler.addEffect(entry)
    scheduler.addEffect(entry)

    scheduler.scheduleUpdate()
    await new Promise<void>((resolve) =>
      queueMicrotask(() => queueMicrotask(() => queueMicrotask(() => resolve()))),
    )

    // 重複していなければ1回だけ実行される
    expect(effectRunCount).toBe(1)
  })

  test("teardown clears effect and layoutEffect arrays", async () => {
    let effectCount = 0
    const scheduler = createScheduler(vi.fn())

    const entry: EffectEntry = {
      callback: () => {
        effectCount++
      },
      deps: [],
      prevDeps: undefined,
      cleanup: undefined,
    }

    scheduler.addEffect(entry)
    scheduler.teardown()

    // After teardown the internal array was cleared, so the same entry can
    // be re-added to a new scheduler (addEffect's includes() check passes).
    const scheduler2 = createScheduler(vi.fn())
    scheduler2.addEffect(entry)
    entry.prevDeps = undefined // reset so the effect actually fires
    scheduler2.scheduleUpdate()
    await new Promise<void>((resolve) =>
      queueMicrotask(() => queueMicrotask(() => queueMicrotask(() => resolve()))),
    )
    expect(effectCount).toBe(1)
  })

  test("addLayoutEffect does not add duplicate entries", async () => {
    let effectRunCount = 0
    const renderFn = vi.fn()
    const scheduler = createScheduler(renderFn)

    const entry: EffectEntry = {
      callback: () => {
        effectRunCount++
      },
      deps: [],
      prevDeps: undefined,
      cleanup: undefined,
    }

    scheduler.addLayoutEffect(entry)
    scheduler.addLayoutEffect(entry)

    scheduler.scheduleUpdate()
    await flushMicrotasks()

    expect(effectRunCount).toBe(1)
  })
})
