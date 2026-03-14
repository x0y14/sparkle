export const supportsDSD =
  typeof HTMLTemplateElement !== "undefined" && "shadowRootMode" in HTMLTemplateElement.prototype

export function polyfillDSD(root?: Document | ShadowRoot): void {
  if (supportsDSD) return
  if (!root) {
    if (typeof document === "undefined") return
    root = document
  }

  const templates = root.querySelectorAll("template[shadowrootmode]")

  for (const template of templates) {
    const tpl = template as HTMLTemplateElement
    const mode = tpl.getAttribute("shadowrootmode") as ShadowRootMode
    const parent = tpl.parentElement
    if (!parent) continue

    try {
      const init: ShadowRootInit & { clonable?: boolean; serializable?: boolean } = { mode }
      if (tpl.hasAttribute("shadowrootdelegatesfocus")) init.delegatesFocus = true
      if (tpl.hasAttribute("shadowrootclonable")) init.clonable = true
      if (tpl.hasAttribute("shadowrootserializable")) init.serializable = true
      const sr = parent.attachShadow(init)
      sr.appendChild(tpl.content.cloneNode(true))
      tpl.remove()
      polyfillDSD(sr)
    } catch {
      if (typeof console !== "undefined") {
        console.warn(
          `[sparkle] DSD polyfill: attachShadow failed for <${parent.tagName.toLowerCase()}>`,
        )
      }
      parent.appendChild(tpl.content.cloneNode(true))
      tpl.remove()
    }
  }
}
