import { defineElement, css, useEffect, useHost, useEvent } from "@sparkio/core"

const UiInputOtp = defineElement(
  {
    tag: "ui-input-otp",
    props: {
      length: { type: Number, value: () => 6 },
      isDisabled: { type: Boolean, value: () => false },
    },
    styles: css`@unocss-placeholder
:host { @apply inline-flex; }`,
  },
  (props) => {
    const host = useHost()
    const dispatchComplete = useEvent<{ value: string }>("complete", { bubbles: true, composed: true })
    const dispatchChange = useEvent<{ value: string }>("change", { bubbles: true, composed: true })

    useEffect(() => {
      const root = host.current.shadowRoot!
      const inputs = root.querySelectorAll("input") as NodeListOf<HTMLInputElement>
      const handler = (e: Event) => {
        const input = e.target as HTMLInputElement
        const idx = Number(input.dataset.idx)
        if (input.value && idx < inputs.length - 1) inputs[idx + 1].focus()
        const val = Array.from(inputs).map(i => i.value).join("")
        dispatchChange({ value: val })
        if (val.length === props.length) dispatchComplete({ value: val })
      }
      const keyHandler = (e: KeyboardEvent) => {
        const input = e.target as HTMLInputElement
        const idx = Number(input.dataset.idx)
        if (e.key === "Backspace" && !input.value && idx > 0) inputs[idx - 1].focus()
      }
      inputs.forEach(i => { i.addEventListener("input", handler); i.addEventListener("keydown", keyHandler) })
      return () => inputs.forEach(i => { i.removeEventListener("input", handler); i.removeEventListener("keydown", keyHandler) })
    }, [props.length])

    const inputs = Array.from({ length: props.length }, (_, i) =>
      `<input data-idx="${i}" maxlength="1" inputmode="numeric" class="w-10 h-12 text-center text-lg font-mono border-2 border-default-200 rounded-lg outline-none focus:border-primary bg-transparent" ${props.isDisabled ? "disabled" : ""}>`
    ).join("")

    return `<div class="flex gap-2">${inputs}</div>`
  },
)

export default UiInputOtp
