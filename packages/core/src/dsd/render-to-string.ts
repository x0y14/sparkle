import { type HookContext, runInContext } from "../hooks/context.js"
import { createScheduler } from "../hooks/scheduler.js"
import { camelToKebab } from "../utils.js"
import { coerceValue } from "../define-element.js"

export type RenderToStringOptions = {
  unoCSS?: string
  /** @deprecated Use slots instead */
  slotContent?: string
  slots?: Record<string, string>
}

function escapeAttr(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

type DSDAttributes = {
  mode: "open" | "closed" | false
  delegatesFocus?: boolean
  clonable?: boolean
  serializable?: boolean
}

function resolveShadowAttrs(shadow: boolean | ShadowRootInit | undefined): DSDAttributes {
  if (shadow === false) return { mode: false }
  if (shadow && typeof shadow === "object") {
    const init = shadow as ShadowRootInit & {
      clonable?: boolean
      serializable?: boolean
    }
    return {
      mode: (init.mode as "open" | "closed") ?? "open",
      delegatesFocus: init.delegatesFocus,
      clonable: init.clonable,
      serializable: init.serializable,
    }
  }
  return { mode: "open" }
}

function buildTemplateAttrs(attrs: DSDAttributes): string {
  if (attrs.mode === false) return ""
  let s = `shadowrootmode="${attrs.mode}"`
  if (attrs.delegatesFocus) s += " shadowrootdelegatesfocus"
  if (attrs.clonable) s += " shadowrootclonable"
  if (attrs.serializable) s += " shadowrootserializable"
  return s
}

const VALID_TAG_RE = /^[a-z][a-z0-9._-]*-[a-z0-9._-]*$/
const VALID_ATTR_RE = /^[a-z_][a-z0-9_-]*$/i

export function renderToString(
  ElementClass: CustomElementConstructor & {
    __sparkle?: boolean
    _styles?: string
    _shadow?: boolean | ShadowRootInit
  },
  rawTag: string,
  props: Record<string, unknown>,
  options?: RenderToStringOptions,
): string {
  let tag = rawTag
  if (!VALID_TAG_RE.test(tag)) {
    if (typeof console !== "undefined") {
      console.warn(`[sparkle] Invalid tag name "${tag}", falling back to "sparkle-component"`)
    }
    tag = "sparkle-component"
  }

  // Build attributes string
  let attrs = ""
  for (const [key, value] of Object.entries(props)) {
    const attrName = camelToKebab(key)
    if (!VALID_ATTR_RE.test(attrName)) continue
    // Prevent SSR XSS via event-handler attributes like onclick/onload, etc.
    if (/^on/i.test(attrName)) continue
    if (value === false || value == null) continue
    if (value === true) {
      attrs += ` ${attrName}`
    } else if (typeof value === "object") {
      attrs += ` ${attrName}="${escapeAttr(JSON.stringify(value))}"`
    } else {
      attrs += ` ${attrName}="${escapeAttr(String(value))}"`
    }
  }

  // Create a SSR HookContext
  const dummyHost = (
    typeof document !== "undefined" ? document.createElement("div") : ({} as HTMLElement)
  ) as HTMLElement

  // SSR でも CSR と同じ coercion を適用する
  const schema = (ElementClass as any)._propsSchema ?? {}
  const coercedProps: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(props)) {
    const propDef = schema[key]
    if (propDef && typeof value === "string") {
      const result = coerceValue(value, propDef.type)
      coercedProps[key] = result.ok ? result.value : value
    } else {
      coercedProps[key] = value
    }
  }
  // スキーマに default value があるが props に含まれないものもシード
  for (const [key, propDef] of Object.entries(schema) as [string, any][]) {
    if (!(key in coercedProps)) {
      coercedProps[key] = propDef.value ? propDef.value() : undefined
    }
  }
  for (const [key, value] of Object.entries(coercedProps)) {
    ;(dummyHost as any)[key] = value
  }

  const scheduler = createScheduler(() => {})
  const ctx: HookContext = {
    host: dummyHost,
    hooks: [],
    update: () => {},
    isSSR: true,
    _scheduler: scheduler,
  }

  let innerHtml = ""

  try {
    const renderFn = (ElementClass as any)._renderFn
    if (renderFn) {
      const result = runInContext(ctx, () => renderFn(coercedProps))
      if (typeof result === "string") {
        innerHtml = result
      } else if (result !== null && result !== undefined) {
        innerHtml = String(result)
      }
    }
  } catch (err) {
    const tagName = tag || (ElementClass as any)._tag || "unknown"
    if (typeof console !== "undefined") {
      console.warn(`[sparkle] SSR render error in <${tagName}>:`, err)
    }
  }

  const componentCss = (ElementClass as any)._styles ?? ""
  const unoCss = options?.unoCSS ?? ""
  const combinedCss = [componentCss, unoCss].filter(Boolean).join("\n")
  const safeCss = combinedCss.replace(/<\/style/gi, "<\\/style")
  const styleTag = combinedCss ? `<style>${safeCss}</style>` : ""

  let slotContent = ""
  if (options?.slots) {
    for (const [, content] of Object.entries(options.slots)) {
      if (!content) continue
      // Astro already adds slot="..." attributes on slotted elements,
      // so we pass content through directly without wrapping in <div>.
      slotContent += content
    }
  } else if (options?.slotContent) {
    slotContent = options.slotContent
  }

  const shadowAttrs = resolveShadowAttrs((ElementClass as any)._shadow)

  if (shadowAttrs.mode === false) {
    return `<${tag}${attrs}>${styleTag}${innerHtml}${slotContent}</${tag}>`
  }

  const templateAttrs = buildTemplateAttrs(shadowAttrs)
  return `<${tag}${attrs}><template ${templateAttrs}>${styleTag}${innerHtml}</template>${slotContent}</${tag}>`
}
