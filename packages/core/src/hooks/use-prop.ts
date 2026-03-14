import { nextIndex, getHookState } from "./context.js"
import { useHost } from "./use-host.js"

type PropHookState = {
  value: unknown
  deps?: unknown[]
  cleanup?: (() => void) | void
  _initialized?: true
}

export function useProp<T>(name: string): [T, (value: T) => void] {
  const { current: host } = useHost()

  if (!(name in host)) {
    throw new Error(`Property "${name}" is not declared on the host element`)
  }

  const index = nextIndex()
  const hookState = getHookState(index) as PropHookState

  if (!hookState._initialized) {
    const setter = (nextValue: T) => {
      ;(host as any)[name] = nextValue
    }
    hookState.value = setter
    hookState._initialized = true
  }

  const value = (host as any)[name] as T
  const setter = hookState.value as (value: T) => void

  return [value, setter]
}
