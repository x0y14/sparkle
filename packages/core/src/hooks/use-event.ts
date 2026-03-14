import { useHost } from "./use-host.js"
import { useMemo } from "./use-memo.js"

export function useEvent<T = void>(
  type: string,
  init?: Omit<CustomEventInit<T>, "detail">,
): (detail: T) => void {
  const hostRef = useHost()

  return useMemo(() => {
    return (detail: T) => {
      hostRef.current.dispatchEvent(new CustomEvent(type, { detail, ...init }))
    }
  }, [type, init?.bubbles, init?.composed, init?.cancelable])
}
