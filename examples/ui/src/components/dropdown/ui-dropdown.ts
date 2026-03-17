import { defineElement, css, useState, useEffect, useHost } from "@sparkio/core"

const UiDropdown = defineElement(
  {
    tag: "ui-dropdown",
    props: {},
    styles: css`@unocss-placeholder
:host { @apply relative inline-block; }`,
  },
  () => {
    const host = useHost()
    const [open, setOpen] = useState(false)

    useEffect(() => {
      const root = host.current.shadowRoot!
      const trigger = root.querySelector("[part='trigger']") as HTMLElement
      if (!trigger) return
      const handler = () => setOpen(!open)
      trigger.addEventListener("click", handler)
      return () => trigger.removeEventListener("click", handler)
    }, [open])

    const menuClass = open ? "" : "hidden"

    return `<div class="relative inline-block"><div part="trigger"><slot name="trigger"></slot></div><div class="${menuClass} absolute z-50 mt-1"><slot></slot></div></div>`
  },
)

export default UiDropdown
