export function adoptUnoCSS(options: { shadowRoots: ShadowRoot[]; sheet: CSSStyleSheet }): void {
  for (const sr of options.shadowRoots) {
    if (!sr.adoptedStyleSheets.includes(options.sheet)) {
      sr.adoptedStyleSheets = [...sr.adoptedStyleSheets, options.sheet]
    }
  }
}
