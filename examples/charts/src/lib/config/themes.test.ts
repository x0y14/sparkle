import { describe, it, expect } from "vitest"
import { resolveTheme, lightTheme, darkTheme } from "./themes"

describe("resolveTheme", () => {
  it("'light'でlightThemeを返す", () => { expect(resolveTheme("light")).toBe(lightTheme) })
  it("'dark'でdarkThemeを返す", () => { expect(resolveTheme("dark")).toBe(darkTheme) })
  it("undefinedでlightThemeを返す", () => { expect(resolveTheme(undefined)).toBe(lightTheme) })
  it("カスタムThemeオブジェクトはそのまま返す", () => {
    const custom = { ...lightTheme, palette: ["#FF0000"] }
    expect(resolveTheme(custom)).toBe(custom)
  })
  it("lightThemeは全フィールドが定義されている", () => {
    expect(lightTheme.colors.background).toBeTruthy()
    expect(lightTheme.palette.length).toBeGreaterThanOrEqual(8)
    expect(lightTheme.fontFamily).toBeTruthy()
    expect(lightTheme.fontSize.label).toBeGreaterThan(0)
  })
})
