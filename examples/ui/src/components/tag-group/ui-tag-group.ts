import { defineElement, css, useEffect, useHost, useEvent } from "@sparkio/core"

const UiTagGroup = defineElement(
  {
    tag: "ui-tag-group",
    props: {
      label: { type: String, value: () => "" },
      selectionMode: { type: String, value: () => "none" },
    },
    styles: css`@unocss-placeholder
:host { @apply block; }`,
  },
  (props) => {
    const host = useHost()
    const dispatchRemove = useEvent<{ key: string }>("remove", { bubbles: true, composed: true })

    useEffect(() => {
      const el = host.current
      const handler = (e: Event) => {
        const ce = e as CustomEvent
        if (ce.detail?.key) dispatchRemove({ key: ce.detail.key })
      }
      el.addEventListener("tag-remove", handler)
      return () => el.removeEventListener("tag-remove", handler)
    }, [])

    const labelHtml = props.label
      ? `<span class="text-sm font-medium text-default-600 mr-2">${props.label}</span>`
      : ""

    return `<div class="flex items-center flex-wrap gap-1">${labelHtml}<slot></slot></div>`
  },
)

export default UiTagGroup
