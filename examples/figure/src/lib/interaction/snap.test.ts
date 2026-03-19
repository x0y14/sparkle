import { describe, it, expect } from "vitest"
import { snap, GRID_SIZE } from "./snap"

describe("snap", () => {
  it("GRID_SIZEが20である", () => { expect(GRID_SIZE).toBe(20) })
  it("0はそのまま0", () => { expect(snap(0)).toBe(0) })
  it("10は丸めて20", () => { expect(snap(10)).toBe(20) })
  it("9は丸めて0", () => { expect(snap(9)).toBe(0) })
  it("25は丸めて20", () => { expect(snap(25)).toBe(20) })
  it("30は丸めて40", () => { expect(snap(30)).toBe(40) })
  it("-15は丸めて-20", () => { expect(snap(-15)).toBe(-20) })
  it("-5は丸めて0", () => { expect(snap(-5)).toBe(0) })
  it("GRIDの倍数はそのまま", () => { expect(snap(60)).toBe(60) })
})
