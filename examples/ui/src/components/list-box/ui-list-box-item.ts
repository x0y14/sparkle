import { defineElement, css, useEffect, useHost, useEvent } from "@sparkio/core"

const UiListBoxItem = defineElement(
  {
    tag: "ui-list-box-item",
    props: {
      key: { type: String, value: () => "" },
      isDisabled: { type: Boolean, value: () => false },
    },
    styles: css`@unocss-placeholder
:host { @apply block; }`,
  },
  (props) => {
    const host = useHost()
    const dispatchSelect = useEvent<{ key: string }>("select", { bubbles: true, composed: true })

    useEffect(() => {
      if (props.isDisabled) return
      const root = host.current.shadowRoot!
      const option = root.querySelector("[role='option']")
      if (!option) return
      const handler = () => dispatchSelect({ key: props.key })
      option.addEventListener("click", handler)
      return () => option.removeEventListener("click", handler)
    }, [props.key, props.isDisabled])

    const disabledClass = props.isDisabled ? "opacity-50 pointer-events-none" : "hover:bg-default-100 cursor-pointer"

    return `<div role="option" class="flex items-center px-3 py-1.5 text-sm ${disabledClass}" ${props.isDisabled ? 'aria-disabled="true"' : ""} tabindex="0"><slot></slot></div>`
  },
)

export default UiListBoxItem
