import { defineElement, css, useEffect, useHost } from "@sparkio/core"
import Markdoc from "@markdoc/markdoc"
import "./md-editor"
import "./md-preview"

const MdLivePreview = defineElement(
  {
    tag: "md-live-preview",
    styles: css`@unocss-placeholder
:host { @apply block h-screen; }`,
  },
  () => {
    const host = useHost()

    useEffect(() => {
      const root = host.current.shadowRoot!
      const editor = root.querySelector("md-editor")
      if (!editor) return
      const handler = ((e: Event) => {
        if (!(e instanceof CustomEvent)) return
        const source = e.detail?.value ?? ""
        const ast = Markdoc.parse(source)
        const content = Markdoc.transform(ast)
        const html = Markdoc.renderers.html(content)
        const preview = root.querySelector("md-preview") as any
        if (preview) preview.content = html
      }) as EventListener
      editor.addEventListener("input", handler)
      return () => editor.removeEventListener("input", handler)
    }, [])

    return `<div class="flex flex-col h-full">
  <header class="flex items-center justify-between px-4 py-2 bg-gray-100 border-b border-gray-200">
    <h1 class="text-lg font-semibold text-gray-800">Markdoc Live Preview</h1>
  </header>
  <div class="flex flex-1 min-h-0">
    <div class="w-1/2 border-r border-gray-200">
      <md-editor></md-editor>
    </div>
    <div class="w-1/2 overflow-auto">
      <md-preview></md-preview>
    </div>
  </div>
</div>`
  },
)

export default MdLivePreview
