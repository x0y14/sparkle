import { describe, it, expect } from "vitest"
import { assignColors } from "./color-palette"

describe("assignColors", () => {
  const palette = ["#A", "#B", "#C"]

  it("シリーズ数がパレット以下なら順番に割当", () => {
    const result = assignColors([{ data: [] }, { data: [] }], palette)
    expect(result).toEqual(["#A", "#B"])
  })

  it("パレット超過時は巡回", () => {
    const result = assignColors([{ data: [] }, { data: [] }, { data: [] }, { data: [] }], palette)
    expect(result).toEqual(["#A", "#B", "#C", "#A"])
  })

  it("明示色はパレットを上書き", () => {
    const result = assignColors([{ data: [], color: "#X" }, { data: [] }], palette)
    expect(result).toEqual(["#X", "#B"])
  })
})
