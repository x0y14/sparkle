import { defineElement, css, useEffect, useHost, useEvent } from "@sparkio/core"

const UiDropdownItem = defineElement(
  {
    tag: "ui-dropdown-item",
    props: {
      key: { type: String, value: () => "" },
      description: { type: String, value: () => "" },
      isDisabled: { type: Boolean, value: () => false },
    },
    styles: css`@unocss-placeholder
:host { @apply block; }`,
  },
  (props) => {
    const host = useHost()
    const dispatchItemPress = useEvent<{ key: string }>("item-press", { bubbles: true, composed: true })

    useEffect(() => {
      if (props.isDisabled) return
      const root = host.current.shadowRoot!
      const btn = root.querySelector("[role='menuitem']")
      if (!btn) return
      const handler = () => dispatchItemPress({ key: props.key })
      btn.addEventListener("click", handler)
      return () => btn.removeEventListener("click", handler)
    }, [props.key, props.isDisabled])

    const descHtml = props.description
      ? `<span class="text-xs text-default-400">${props.description}</span>`
      : ""
    const disabledClass = props.isDisabled ? "opacity-50 pointer-events-none" : "hover:bg-default-100 cursor-pointer"

    return `<div role="menuitem" class="flex flex-col px-3 py-1.5 ${disabledClass}" ${props.isDisabled ? 'aria-disabled="true"' : ""}><span><slot></slot></span>${descHtml}</div>`
  },
)

export default UiDropdownItem
