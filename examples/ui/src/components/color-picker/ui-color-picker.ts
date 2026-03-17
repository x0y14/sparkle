import { defineElement, css, useEffect, useHost, useEvent, useState } from "@sparkio/core"

const UiColorPicker = defineElement(
  {
    tag: "ui-color-picker",
    props: {},
    styles: css`@unocss-placeholder
:host { @apply inline-block; }`,
  },
  (props) => {
    const host = useHost()
    const [isOpen, setIsOpen] = useState(false)
    const dispatchChange = useEvent<{ color: string }>("change", { bubbles: true, composed: true })

    useEffect(() => {
      const root = host.current.shadowRoot!
      const trigger = root.querySelector("[data-trigger]")
      if (!trigger) return
      const handler = () => setIsOpen(!isOpen)
      trigger.addEventListener("click", handler)
      return () => trigger.removeEventListener("click", handler)
    }, [isOpen])

    const popoverClass = isOpen ? "block" : "hidden"

    return `<div class="relative inline-flex">
  <button data-trigger type="button" class="inline-flex items-center gap-2 px-3 py-2 border border-default-200 rounded-md bg-default-100 cursor-pointer hover:bg-default-200 transition-colors">
    <span class="w-5 h-5 rounded-sm border border-default-300" style="background-color: #000"></span>
    <span class="text-sm">Color</span>
  </button>
  <div class="${popoverClass} absolute top-full left-0 mt-2 p-3 bg-white border border-default-200 rounded-lg shadow-lg z-50 min-w-[200px]">
    <slot></slot>
  </div>
</div>`
  },
)

export default UiColorPicker
