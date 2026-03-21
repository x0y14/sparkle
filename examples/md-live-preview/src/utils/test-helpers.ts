export async function createElement<T extends HTMLElement>(
  tag: string,
  attrs?: Record<string, string>,
  innerHTML?: string,
): Promise<T> {
  const el = document.createElement(tag) as T
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v)
  }
  if (innerHTML) el.innerHTML = innerHTML
  document.body.appendChild(el)
  await new Promise((r) => setTimeout(r, 0))
  return el
}

export function sr(el: HTMLElement): ShadowRoot {
  const s = el.shadowRoot
  if (!s) throw new Error(`${el.tagName} has no shadowRoot`)
  return s
}

export function sq(el: HTMLElement, selector: string): Element | null {
  return sr(el).querySelector(selector)
}

export function sqa(el: HTMLElement, selector: string): Element[] {
  return [...sr(el).querySelectorAll(selector)]
}

export function cleanup(el: HTMLElement): void {
  el.remove()
}
