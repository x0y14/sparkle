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
})
