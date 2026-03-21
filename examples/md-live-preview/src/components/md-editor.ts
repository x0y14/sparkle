import { defineElement, css, useProp, useEffect, useHost, useEvent } from "@sparkio/core"

const MdEditor = defineElement(
  {
    tag: "md-editor",
    props: {
      value: { type: String, reflect: true, value: () => "" },
      placeholder: { type: String, value: () => "Enter Markdoc here..." },
    },
    styles: css`@unocss-placeholder
:host { @apply block h-full; }`,
  },
  (props) => {
    const [value, setValue] = useProp<string>("value")
    const host = useHost()
    const dispatchInput = useEvent<{ value: string }>("input", { bubbles: true, composed: true })

    useEffect(() => {
      const root = host.current.shadowRoot!
      const ta = root.querySelector("textarea")
      if (!ta) return
      const handler = (e: Event) => {
        const v = (e.target as HTMLTextAreaElement).value
        setValue(v)
        dispatchInput({ value: v })
      }
      ta.addEventListener("input", handler)
      return () => ta.removeEventListener("input", handler)
    }, [])

    return `<textarea placeholder="${props.placeholder}" class="w-full h-full p-4 font-mono text-sm bg-gray-50 border-none outline-none resize-none">${value}</textarea>`
  },
)

export default MdEditor
