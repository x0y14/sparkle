import { getCurrent, nextIndex, getHookState } from "./context.js"
import type { EffectEntry } from "./scheduler.js"

type EffectHookState = {
  value: unknown
  deps?: unknown[]
  cleanup?: (() => void) | void
  _effectEntry?: EffectEntry
}

export function useLayoutEffect(callback: () => (() => void) | void, deps?: unknown[]): void {
  const ctx = getCurrent()
  if (ctx.isSSR) return

  const index = nextIndex()
  const hookState = getHookState(index) as EffectHookState

  if (!hookState._effectEntry) {
    const entry: EffectEntry = {
      callback,
      deps,
      prevDeps: undefined,
      cleanup: undefined,
    }
    hookState._effectEntry = entry
    ctx._scheduler!.addLayoutEffect(entry)
    entry._scheduler = ctx._scheduler
  } else {
    const entry = hookState._effectEntry
    entry.callback = callback
    entry.deps = deps
    if (entry._scheduler !== ctx._scheduler) {
      entry.prevDeps = undefined
      entry.cleanup = undefined
      ctx._scheduler!.addLayoutEffect(entry)
      entry._scheduler = ctx._scheduler
    }
  }
}
