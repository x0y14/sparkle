import { nextIndex, getHookState } from "./context.js"
import { argsChanged } from "./utils.js"

export function useMemo<T>(factory: () => T, deps: unknown[]): T {
  const index = nextIndex()
  const hookState = getHookState(index)

  if (argsChanged(hookState.deps, deps)) {
    hookState.value = factory()
    hookState.deps = deps
  }

  return hookState.value as T
}
