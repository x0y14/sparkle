import { defineElement, useEvent, useHost, useEffect } from "@sparkio/core"

const EventElement = defineElement(
  {
    tag: "event-element",
  },
  () => {
    const dispatch = useEvent("sparkio:ping", {
      bubbles: true,
      composed: true,
    })
    const host = useHost()

    useEffect(() => {
      const root = host.current.shadowRoot!
      const btn = root.querySelector("#event-btn") as HTMLButtonElement | null
      if (!btn) return
      const handler = () => dispatch(undefined as void)
      btn.addEventListener("click", handler)
      return () => btn.removeEventListener("click", handler)
    }, [])

    return `<button id="event-btn">ping</button>`
  },
)

export default EventElement
