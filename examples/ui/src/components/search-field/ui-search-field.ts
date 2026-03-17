import { defineElement, css, useProp, useEffect, useHost, useEvent } from "@sparkio/core"

const UiSearchField = defineElement(
  {
    tag: "ui-search-field",
    props: {
      value: { type: String, reflect: true, value: () => "" },
      placeholder: { type: String, value: () => "Search..." },
      isDisabled: { type: Boolean, value: () => false },
    },
    styles: css`@unocss-placeholder
:host { @apply block; }`,
  },
  (props) => {
    const [value, setValue] = useProp<string>("value")
    const host = useHost()
    const dispatchInput = useEvent<{ value: string }>("input", { bubbles: true, composed: true })
    const dispatchClear = useEvent("clear", { bubbles: true, composed: true })
    const dispatchSubmit = useEvent<{ value: string }>("submit", { bubbles: true, composed: true })

    useEffect(() => {
      const root = host.current.shadowRoot!
      const input = root.querySelector("input")
      const clearBtn = root.querySelector("[data-clear]")
      if (!input) return
      const onInput = (e: Event) => { const v = (e.target as HTMLInputElement).value; setValue(v); dispatchInput({ value: v }) }
      const onKey = (e: KeyboardEvent) => { if (e.key === "Enter") dispatchSubmit({ value: input.value }) }
      const onClear = () => { setValue(""); dispatchClear(); input.focus() }
      input.addEventListener("input", onInput)
      input.addEventListener("keydown", onKey)
      if (clearBtn) clearBtn.addEventListener("click", onClear)
      return () => { input.removeEventListener("input", onInput); input.removeEventListener("keydown", onKey); if (clearBtn) clearBtn.removeEventListener("click", onClear) }
    }, [])

    const clearBtn = value ? `<button data-clear class="cursor-pointer opacity-50 hover:opacity-100"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"></path></svg></button>` : ""

    return `<div class="flex items-center bg-default-100 rounded-lg h-10 px-3 gap-2 transition-colors hover:bg-default-200 focus-within:bg-default-100 ${props.isDisabled ? 'opacity-50 pointer-events-none' : ''}">
  <svg class="w-4 h-4 text-default-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="M21 21l-4.35-4.35"></path></svg>
  <input type="search" value="${value}" placeholder="${props.placeholder}" class="flex-1 bg-transparent outline-none text-foreground placeholder-default-400 text-sm" ${props.isDisabled ? "disabled" : ""}>
  ${clearBtn}
</div>`
  },
)

export default UiSearchField
