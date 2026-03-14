export function createSharedSheet(cssText: string): CSSStyleSheet {
  const sheet = new CSSStyleSheet()
  sheet.replaceSync(cssText)
  return sheet
}
