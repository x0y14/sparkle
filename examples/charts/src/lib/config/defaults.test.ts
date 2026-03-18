import { describe, it, expect } from "vitest"
import { DEFAULT_FORMAT, DEFAULT_LINE_WIDTH, DEFAULT_BAR_WIDTH } from "./defaults"

describe("defaults", () => {
  it("DEFAULT_LINE_WIDTHは2", () => { expect(DEFAULT_LINE_WIDTH).toBe(2) })
  it("DEFAULT_BAR_WIDTHは0.8", () => { expect(DEFAULT_BAR_WIDTH).toBe(0.8) })
  it("DEFAULT_FORMAT: 整数", () => { expect(DEFAULT_FORMAT(42)).toBe("42") })
  it("DEFAULT_FORMAT: 小数", () => { expect(DEFAULT_FORMAT(3.14159)).toBe("3.14") })
  it("DEFAULT_FORMAT: 千", () => { expect(DEFAULT_FORMAT(5000)).toBe("5.0K") })
  it("DEFAULT_FORMAT: 百万", () => { expect(DEFAULT_FORMAT(2500000)).toBe("2.5M") })
})
