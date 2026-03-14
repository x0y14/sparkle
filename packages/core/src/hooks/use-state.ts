import { getCurrent, nextIndex, getHookState } from "./context.js"

type HookStateWithInit = { value: unknown; _initialized?: true }

export function useState<T>(initial: T | (() => T)): [T, (value: T | ((prev: T) => T)) => void] {
  const ctx = getCurrent()
  const index = nextIndex()
  const hookState = getHookState(index) as HookStateWithInit

  if (!hookState._initialized) {
    const initVal = typeof initial === "function" ? (initial as () => T)() : initial
    const setter = (nextValue: T | ((prev: T) => T)) => {
      const tuple = hookState.value as [T, typeof setter]
      const prev = tuple[0]
      const next = typeof nextValue === "function" ? (nextValue as (p: T) => T)(prev) : nextValue
      if (Object.is(prev, next)) return
      tuple[0] = next
      // 常に最新の _hookCtx を参照して update を呼ぶ
      const host = ctx.host as any
      if (host._hookCtx) {
        host._hookCtx.update()
      } else {
        ctx.update()
      }
    }
    hookState.value = [initVal, setter]
    hookState._initialized = true
  }

  return hookState.value as [T, (value: T | ((prev: T) => T)) => void]
}
