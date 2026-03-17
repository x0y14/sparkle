import { defineElement, css, useEffect, useHost, useEvent } from "@sparkio/core"

const UiMenuItem = defineElement(
  {
    tag: "ui-menu-item",
    props: {
      key: { type: String, value: () => "" },
      isDisabled: { type: Boolean, value: () => false },
    },
    styles: css`@unocss-placeholder
:host { @apply block; }`,
  },
  (props) => {
    const host = useHost()
    const dispatchPress = useEvent<{ key: string }>("press", { bubbles: true, composed: true })

    useEffect(() => {
      if (props.isDisabled) return
      const root = host.current.shadowRoot!
      const item = root.querySelector("[role='menuitem']")
      if (!item) return
      const handler = () => dispatchPress({ key: props.key })
      item.addEventListener("click", handler)
      return () => item.removeEventListener("click", handler)
    }, [props.key, props.isDisabled])

    const disabledClass = props.isDisabled ? "opacity-50 pointer-events-none" : "hover:bg-default-100 cursor-pointer"

    return `<div role="menuitem" class="flex items-center px-3 py-1.5 text-sm ${disabledClass}" ${props.isDisabled ? 'aria-disabled="true"' : ""} tabindex="0"><slot></slot></div>`
  },
)

export default UiMenuItem
