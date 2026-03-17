import { defineElement, css, useEffect, useHost, useEvent } from "@sparkio/core"

const UiAlertDialog = defineElement(
  {
    tag: "ui-alert-dialog",
    props: {
      isOpen: { type: Boolean, value: () => false },
      title: { type: String, value: () => "" },
      description: { type: String, value: () => "" },
      isDismissable: { type: Boolean, value: () => false },
    },
    styles: css`@unocss-placeholder
:host { @apply block; }`,
  },
  (props) => {
    const host = useHost()
    const dispatchOpenChange = useEvent<{ isOpen: boolean }>("open-change", { bubbles: true, composed: true })

    useEffect(() => {
      const root = host.current.shadowRoot!
      const backdrop = root.querySelector("[data-backdrop]") as HTMLElement
      if (!backdrop || !props.isDismissable) return
      const handler = (e: Event) => {
        if (e.target === backdrop) dispatchOpenChange({ isOpen: false })
      }
      backdrop.addEventListener("click", handler)
      return () => backdrop.removeEventListener("click", handler)
    }, [props.isOpen, props.isDismissable])

    const openClass = props.isOpen ? "flex" : "hidden"
    const titleHtml = props.title
      ? `<h2 class="text-lg font-semibold text-default-900">${props.title}</h2>`
      : ""
    const descHtml = props.description
      ? `<p class="text-sm text-default-500 mt-1">${props.description}</p>`
      : ""

    return `<dialog class="${openClass} fixed inset-0 z-50 items-center justify-center w-full h-full bg-transparent" ${props.isOpen ? "open" : ""}>
  <div data-backdrop class="fixed inset-0 bg-black/50"></div>
  <div class="relative z-10 w-full max-w-md mx-4 bg-white rounded-xl shadow-xl p-6" role="alertdialog" aria-modal="true">
    <div class="mb-4">
      ${titleHtml}
      ${descHtml}
    </div>
    <slot></slot>
    <div class="flex justify-end gap-2 mt-4">
      <slot name="cancel"></slot>
      <slot name="action"></slot>
    </div>
  </div>
</dialog>`
  },
)

export default UiAlertDialog
