import { defineElement, css, useEffect, useHost, useEvent } from "@sparkio/core"

const UiForm = defineElement(
  {
    tag: "ui-form",
    props: {},
    styles: css`@unocss-placeholder
:host { @apply block; }`,
  },
  () => {
    const host = useHost()
    const dispatchSubmit = useEvent<{ formData: FormData }>("submit", { bubbles: true, composed: true })

    useEffect(() => {
      const root = host.current.shadowRoot!
      const form = root.querySelector("form")
      if (!form) return
      const handler = (e: Event) => {
        e.preventDefault()
        const formData = new FormData(form)
        dispatchSubmit({ formData })
      }
      form.addEventListener("submit", handler)
      return () => form.removeEventListener("submit", handler)
    }, [])

    return `<form><slot></slot></form>`
  },
)

export default UiForm
