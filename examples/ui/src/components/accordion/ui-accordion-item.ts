import { defineElement, css, useState, useEffect, useHost } from "@sparkio/core"

const UiAccordionItem = defineElement(
  {
    tag: "ui-accordion-item",
    props: {
      key: { type: String, value: () => "" },
      title: { type: String, value: () => "" },
      subtitle: { type: String, value: () => "" },
      isDisabled: { type: Boolean, value: () => false },
    },
    styles: css`@unocss-placeholder
:host { @apply block; }`,
  },
  (props) => {
    const host = useHost()
    const [open, setOpen] = useState(false)

    useEffect(() => {
      if (props.isDisabled) return
      const root = host.current.shadowRoot!
      const btn = root.querySelector("button")
      if (!btn) return
      const handler = () => setOpen(!open)
      btn.addEventListener("click", handler)
      return () => btn.removeEventListener("click", handler)
    }, [open, props.isDisabled])

    const subtitleHtml = props.subtitle
      ? `<span class="text-xs text-default-400">${props.subtitle}</span>`
      : ""
    const regionClass = open ? "" : "hidden"
    const disabledClass = props.isDisabled ? "opacity-50 pointer-events-none" : ""

    return `<div class="border-b border-default-200 ${disabledClass}"><h3><button class="flex w-full items-center justify-between py-3 px-2 text-left cursor-pointer" aria-expanded="${open}" ${props.isDisabled ? "disabled" : ""}><span class="flex flex-col"><span class="text-base font-medium">${props.title}</span>${subtitleHtml}</span><svg class="w-4 h-4 transition-transform ${open ? "rotate-180" : ""}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"></path></svg></button></h3><div role="region" class="${regionClass} px-2 pb-3"><slot></slot></div></div>`
  },
)

export default UiAccordionItem
