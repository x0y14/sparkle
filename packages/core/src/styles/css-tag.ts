import { createSharedSheet } from "./create-shared-sheet.js"

export class CSSResult {
  readonly cssText: string
  private _sheet: CSSStyleSheet | undefined

  constructor(cssText: string) {
    this.cssText = cssText
  }

  get styleSheet(): CSSStyleSheet {
    if (!this._sheet) {
      this._sheet = createSharedSheet(this.cssText)
    }
    return this._sheet
  }
}

export function css(strings: TemplateStringsArray, ...values: unknown[]): CSSResult {
  let cssText = ""
  strings.forEach((str, i) => {
    cssText += str
    if (i < values.length) cssText += String(values[i])
  })
  return new CSSResult(cssText)
}
