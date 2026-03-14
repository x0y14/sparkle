import { argsChanged } from "./utils.js"

export type EffectEntry = {
  callback: () => (() => void) | void
  deps: unknown[] | undefined
  prevDeps: unknown[] | undefined
  cleanup: (() => void) | void
  _scheduler?: RenderScheduler
}

export type RenderScheduler = {
  scheduleUpdate: () => void
  addEffect: (entry: EffectEntry) => void
  addLayoutEffect: (entry: EffectEntry) => void
  teardown: () => void
}

export function createScheduler(renderFn: () => void): RenderScheduler {
  let updateQueued = false
  let torn = false
  const effects: EffectEntry[] = []
  const layoutEffects: EffectEntry[] = []

  function runEffectList(list: EffectEntry[]): void {
    for (const entry of list) {
      if (argsChanged(entry.prevDeps, entry.deps ?? [])) {
        if (typeof entry.cleanup === "function") {
          entry.cleanup()
        }
        entry.cleanup = entry.callback()
        entry.prevDeps = entry.deps
      }
    }
  }

  function scheduleUpdate(): void {
    if (torn || updateQueued) return
    updateQueued = true
    queueMicrotask(() => {
      if (torn) {
        updateQueued = false
        return
      }
      updateQueued = false
      renderFn()
      runEffectList(layoutEffects)
      queueMicrotask(() => {
        if (!torn) runEffectList(effects)
      })
    })
  }

  function addEffect(entry: EffectEntry): void {
    if (!effects.includes(entry)) {
      effects.push(entry)
    }
  }

  function addLayoutEffect(entry: EffectEntry): void {
    if (!layoutEffects.includes(entry)) {
      layoutEffects.push(entry)
    }
  }

  function teardown(): void {
    torn = true
    for (const e of [...effects, ...layoutEffects]) {
      if (typeof e.cleanup === "function") {
        e.cleanup()
      }
    }
    // Clear the local arrays so stale entries don't interfere.
    // Note: EffectEntry objects still exist in HookContext.hooks — this is
    // intentional so that hook state survives disconnect/reconnect. On the
    // next render pass, useEffect/useLayoutEffect will re-add them to the
    // new scheduler's arrays.
    effects.length = 0
    layoutEffects.length = 0
  }

  return { scheduleUpdate, addEffect, addLayoutEffect, teardown }
}
