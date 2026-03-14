import { getCurrent, nextIndex, getHookState } from "./context.js"
import { useEffect } from "./use-effect.js"
import { CONTEXT_EVENT, type ContextRequestDetail } from "./context-symbols.js"
import type { SparkleContext } from "./create-context.js"

type ContextHookState<T> = {
  value: unknown
  _context?: SparkleContext<T>
  _value?: T
  _hasProvider?: boolean
  _unsubscribe?: () => void
  _subscriber?: (v: T) => void
  _update?: () => void
}

/**
 * Subscribe to a SparkleContext value.
 *
 * **SSR limitation**: In SSR (`renderToString`), `useContext` always returns
 * `context.defaultValue` because the Context Protocol relies on DOM events
 * which are not available during server-side rendering.
 */
export function useContext<T>(context: SparkleContext<T>): T {
  const ctx = getCurrent()
  if (ctx.isSSR) {
    nextIndex() // useContext 本体のスロット (CSR L26 相当)
    nextIndex() // 内部 useEffect のスロット (CSR L60 相当)
    return context.defaultValue
  }

  const index = nextIndex()
  const state = getHookState(index) as ContextHookState<T>
  state._update = ctx.update

  if (!state._subscriber) {
    state._subscriber = (value: T) => {
      if (Object.is(state._value, value)) return
      state._value = value
      state._update?.()
    }
  }

  // context が変わったとき (または初回) に再サブスクライブ
  if (state._context !== context) {
    state._unsubscribe?.()
    state._context = context

    const detail: ContextRequestDetail<T, SparkleContext<T>> = {
      context,
      callback: state._subscriber,
    }

    ctx.host.dispatchEvent(
      new CustomEvent(CONTEXT_EVENT, {
        detail,
        bubbles: true,
        composed: true,
        cancelable: true,
      }),
    )

    state._hasProvider = !!detail.unsubscribe
    state._value = state._hasProvider ? detail.value : context.defaultValue
    state._unsubscribe = detail.unsubscribe
  }

  // disconnect 時にサブスクリプション解除
  useEffect(
    () => () => {
      state._unsubscribe?.()
      state._unsubscribe = undefined
      state._hasProvider = false
      state._context = undefined
    },
    [],
  )

  return state._hasProvider ? (state._value as T) : context.defaultValue
}
