import { defineElement, css, useState, useEffect, useHost, useEvent } from "@sparkio/core"
import * as V from "../../utils/variants"

const UiPagination = defineElement(
  {
    tag: "ui-pagination",
    props: {
      total: { type: Number, value: () => 1 },
      page: { type: Number, value: () => 1 },
      color: { type: String, value: () => "primary" },
      size: { type: String, value: () => "md" },
      isDisabled: { type: Boolean, value: () => false },
    },
    styles: css`@unocss-placeholder
:host { @apply block; }`,
  },
  (props) => {
    const host = useHost()
    const dispatchChange = useEvent<{ page: number }>("change", { bubbles: true, composed: true })

    useEffect(() => {
      if (props.isDisabled) return
      const root = host.current.shadowRoot!
      const buttons = root.querySelectorAll("button[data-page]")
      const handlers: Array<[Element, EventListener]> = []
      buttons.forEach((btn) => {
        const handler = () => {
          const p = Number(btn.getAttribute("data-page"))
          if (p >= 1 && p <= props.total) dispatchChange({ page: p })
        }
        btn.addEventListener("click", handler)
        handlers.push([btn, handler])
      })
      return () => handlers.forEach(([b, h]) => b.removeEventListener("click", h))
    }, [props.page, props.total, props.isDisabled])

    const pages: string[] = []
    for (let i = 1; i <= props.total; i++) {
      const active = i === props.page ? "bg-primary text-primary-foreground" : "bg-default-100 hover:bg-default-200"
      pages.push(`<li><button data-page="${i}" class="min-w-8 h-8 flex items-center justify-center rounded-md ${active}" ${props.isDisabled ? "disabled" : ""}>${i}</button></li>`)
    }

    const disabledClass = props.isDisabled ? "opacity-50 pointer-events-none" : ""

    return `<nav aria-label="Pagination" class="${disabledClass}"><ul class="flex items-center gap-1"><li><button data-page="${props.page - 1}" class="min-w-8 h-8 flex items-center justify-center rounded-md bg-default-100 hover:bg-default-200" ${props.isDisabled || props.page <= 1 ? "disabled" : ""} aria-label="Previous">&#8249;</button></li>${pages.join("")}<li><button data-page="${props.page + 1}" class="min-w-8 h-8 flex items-center justify-center rounded-md bg-default-100 hover:bg-default-200" ${props.isDisabled || props.page >= props.total ? "disabled" : ""} aria-label="Next">&#8250;</button></li></ul></nav>`
  },
)

export default UiPagination
