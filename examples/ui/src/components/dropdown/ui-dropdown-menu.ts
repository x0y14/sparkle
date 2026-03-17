import { defineElement, css, useEffect, useHost, useEvent } from "@sparkio/core"

const UiDropdownMenu = defineElement(
  {
    tag: "ui-dropdown-menu",
    props: {},
    styles: css`@unocss-placeholder
:host { @apply block; }`,
  },
  () => {
    const host = useHost()
    const dispatchAction = useEvent<{ key: string }>("action", { bubbles: true, composed: true })

    useEffect(() => {
      const el = host.current
      const handler = (e: Event) => {
        const ce = e as CustomEvent
        if (ce.detail?.key) dispatchAction({ key: ce.detail.key })
      }
      el.addEventListener("item-press", handler)
      return () => el.removeEventListener("item-press", handler)
    }, [])

    return `<div class="bg-content1 rounded-lg shadow-lg border border-default-200 py-1 min-w-[200px]" role="menu"><slot></slot></div>`
  },
)

export default UiDropdownMenu
