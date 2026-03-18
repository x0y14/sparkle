import { describe, it, expect } from "vitest"
import { hexToRGBA } from "./color"

describe("hexToRGBA", () => {
  it("#FF0000 → [1, 0, 0, 1]", () => {
    expect(hexToRGBA("#FF0000")).toEqual([1, 0, 0, 1])
  })

  it("#000000 → [0, 0, 0, 1]", () => {
    expect(hexToRGBA("#000000")).toEqual([0, 0, 0, 1])
  })

  it("# なしでも動作", () => {
    expect(hexToRGBA("808080")).toEqual([
      128 / 255, 128 / 255, 128 / 255, 1,
    ])
  })

  it("小文字 hex を正しくパースする", () => {
    expect(hexToRGBA("#ff0000")).toEqual([1, 0, 0, 1])
  })

  it("短い hex 文字列でエラーにならない", () => {
    // Behavior: NaN for missing components, should not throw
    expect(() => hexToRGBA("#FF")).not.toThrow()
  })
})
