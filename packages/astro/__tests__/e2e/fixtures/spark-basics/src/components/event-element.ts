import { defineElement, useEvent, useEffect, useHost } from "@sparkle/core"

export const EventElement = defineElement({ tag: "event-element" }, () => {
  // useEvent は useMemo でメモ化された dispatch 関数を返す
  // dispatch() を呼ぶと host 要素から CustomEvent が発火する
  const dispatch = useEvent<void>("sparkle:ping", {
    bubbles: true,
    composed: true,
  })
  const hostRef = useHost()

  useEffect(() => {
    const btn = hostRef.current.shadowRoot?.querySelector("#event-btn") as HTMLButtonElement | null
    if (!btn) return
    const handler = () => dispatch()
    btn.addEventListener("click", handler)
    return () => btn.removeEventListener("click", handler)
  }, [])

  return `<button id="event-btn">Dispatch</button>`
})
