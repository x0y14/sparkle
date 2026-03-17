import { defineElement, css, useState, useEffect, useHost } from "@sparkio/core"

const UiDisclosure = defineElement(
  {
    tag: "ui-disclosure",
    props: {
      title: { type: String, value: () => "" },
      isOpen: { type: Boolean, value: () => false },
    },
    styles: css`@unocss-placeholder
:host { @apply block; }`,
  },
  (props) => {
    const host = useHost()
    const [open, setOpen] = useState(props.isOpen)

    useEffect(() => {
      const root = host.current.shadowRoot!
      const btn = root.querySelector("button")
      if (!btn) return
      const handler = () => setOpen(!open)
      btn.addEventListener("click", handler)
      return () => btn.removeEventListener("click", handler)
    }, [open])

    const regionClass = open ? "" : "hidden"

    return `<div class="border border-default-200 rounded-lg"><button class="flex w-full items-center justify-between p-3 text-left cursor-pointer" aria-expanded="${open}"><span class="font-medium">${props.title}</span><svg class="w-4 h-4 transition-transform ${open ? "rotate-180" : ""}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"></path></svg></button><div role="region" class="${regionClass} p-3 pt-0"><slot></slot></div></div>`
  },
)

export default UiDisclosure
