import { defineElement, css, useEffect, useHost, useEvent } from "@sparkio/core"

const UiColorField = defineElement(
  {
    tag: "ui-color-field",
    props: {
      value: { type: String, value: () => "" },
      label: { type: String, value: () => "" },
    },
    styles: css`@unocss-placeholder
:host { @apply block; }`,
  },
  (props) => {
    const host = useHost()
    const dispatchChange = useEvent<{ color: string }>("change", { bubbles: true, composed: true })

    useEffect(() => {
      const root = host.current.shadowRoot!
      const input = root.querySelector("input")
      if (!input) return
      const handler = (e: Event) => {
        dispatchChange({ color: (e.target as HTMLInputElement).value })
      }
      input.addEventListener("change", handler)
      return () => input.removeEventListener("change", handler)
    }, [])

    const labelHtml = props.label
      ? `<label class="block text-sm font-medium text-default-700 mb-1">${props.label}</label>`
      : ""

    return `${labelHtml}<input type="text" value="${props.value}" class="w-full px-3 py-2 text-sm border border-default-200 rounded-md bg-default-100 outline-none focus:border-primary transition-colors" placeholder="#000000" />`
  },
)

export default UiColorField
