import { defineElement, css, useProp, useEffect, useHost, useEvent } from "@sparkio/core"

const LayoutEditor = defineElement(
  {
    tag: "layout-editor",
    props: {
      value: { type: String, reflect: true, value: () => "" },
      placeholder: { type: String, value: () => "Enter layout JSON here..." },
    },
    styles: css`@unocss-placeholder
:host { @apply block h-full; }`,
  },
  (props) => {
    const [value, setValue] = useProp<string>("value")
    const host = useHost()
    const dispatchInput = useEvent<{ value: string }>("input", {
      bubbles: true,
      composed: true,
    })

    useEffect(() => {
      const root = host.current.shadowRoot!
      const ta = root.querySelector("textarea")
      if (!ta) return
      const inputHandler = (e: Event) => {
        const v = (e.target as HTMLTextAreaElement).value
        setValue(v)
        dispatchInput({ value: v })
      }
      ta.addEventListener("input", inputHandler)
      return () => {
        ta.removeEventListener("input", inputHandler)
      }
    }, [])

    return `<textarea placeholder="${props.placeholder}" class="w-full h-full p-4 font-mono text-sm bg-gray-50 border-none outline-none resize-none">${value}</textarea>`
  },
)

export default LayoutEditor
