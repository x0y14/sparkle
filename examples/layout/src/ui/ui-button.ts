import { defineElement, css, useEffect, useHost, useEvent } from "@sparkio/core"
import * as V from "./variants"

const UiButton = defineElement(
  {
    tag: "ui-button",
    props: {
      variant: { type: String, value: () => "solid" },
      color: { type: String, value: () => "primary" },
      size: { type: String, value: () => "md" },
      radius: { type: String, value: () => "md" },
      isDisabled: { type: Boolean, value: () => false },
      isIconOnly: { type: Boolean, value: () => false },
      isLoading: { type: Boolean, value: () => false },
      fullWidth: { type: Boolean, value: () => false },
    },
    styles: css`@unocss-placeholder
:host { @apply inline-flex; width: 100%; height: 100%; }
:host([full-width]) { @apply block; }`,
  },
  (props) => {
    const host = useHost()
    const dispatchPress = useEvent("press", { bubbles: true, composed: true })

    useEffect(() => {
      const root = host.current.shadowRoot!
      const btn = root.querySelector("button")
      if (!btn) return
      const handler = () => {
        if (!props.isDisabled && !props.isLoading) dispatchPress()
      }
      btn.addEventListener("click", handler)
      return () => btn.removeEventListener("click", handler)
    }, [props.isDisabled, props.isLoading])

    const radiusClass = V.radius[props.radius as V.Radius] || V.radius.md
    const sizeClass = props.isIconOnly
      ? (V.buttonIconOnlySizeFit[props.size as V.Size] || V.buttonIconOnlySizeFit.md)
      : (V.buttonSizeFit[props.size as V.Size] || V.buttonSizeFit.md)
    const variantColors = V.buttonVariant[props.variant] || V.buttonVariant.solid
    const colorClass = variantColors[props.color as V.Color] || variantColors.primary
    const widthClass = props.fullWidth ? "w-full" : ""
    const disabledClass = props.isDisabled ? "opacity-50 pointer-events-none" : "cursor-pointer"

    const spinner = props.isLoading
      ? `<svg class="animate-spin w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" opacity="0.25"></circle><path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round"></path></svg>`
      : ""

    return `<button class="inline-flex items-center justify-center font-medium transition-all w-full h-full ${radiusClass} ${sizeClass} ${colorClass} ${widthClass} ${disabledClass}" ${props.isDisabled ? "disabled" : ""} ${props.isLoading ? 'aria-busy="true"' : ""}>${spinner}<slot></slot></button>`
  },
)

export default UiButton
