import { defineElement, css, useState, useEffect, useHost, useEvent } from "@sparkio/core"
import * as V from "../../utils/variants"

const UiToggleButton = defineElement(
  {
    tag: "ui-toggle-button",
    props: {
      isSelected: { type: Boolean, value: () => false },
      isDisabled: { type: Boolean, value: () => false },
      color: { type: String, value: () => "primary" },
      size: { type: String, value: () => "md" },
      variant: { type: String, value: () => "flat" },
    },
    styles: css`@unocss-placeholder
:host { @apply inline-flex; }`,
  },
  (props) => {
    const host = useHost()
    const dispatchChange = useEvent<{ selected: boolean }>("change", { bubbles: true, composed: true })

    useEffect(() => {
      const root = host.current.shadowRoot!
      const btn = root.querySelector("button")
      if (!btn || props.isDisabled) return
      const handler = () => dispatchChange({ selected: !props.isSelected })
      btn.addEventListener("click", handler)
      return () => btn.removeEventListener("click", handler)
    }, [props.isSelected, props.isDisabled])

    const sizeClass = V.buttonSize[props.size as V.Size] || V.buttonSize.md
    const colorClass = props.isSelected
      ? (V.buttonVariant[props.variant] || V.buttonVariant.flat)[props.color as V.Color]
      : (V.buttonVariant.flat || V.buttonVariant.flat).default
    const disabledClass = props.isDisabled ? "opacity-50 pointer-events-none" : "cursor-pointer"

    return `<button class="inline-flex items-center justify-center font-medium transition-all rounded-md ${sizeClass} ${colorClass} ${disabledClass}" aria-pressed="${props.isSelected}" ${props.isDisabled ? "disabled" : ""}><slot></slot></button>`
  },
)

export default UiToggleButton
