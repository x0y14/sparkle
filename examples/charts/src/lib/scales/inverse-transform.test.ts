import { describe, it, expect } from "vitest"
import { cssPixelToData, isInsidePlotRect } from "./inverse-transform"

describe("cssPixelToData", () => {
  const plot = { x: 0, y: 0, width: 800, height: 600 }

  it("左下隅→domainMin", () => {
    const { dataX, dataY } = cssPixelToData(0, 600, plot, 0, 100, 0, 50)
    expect(dataX).toBeCloseTo(0)
    expect(dataY).toBeCloseTo(0)
  })

  it("右上隅→domainMax", () => {
    const { dataX, dataY } = cssPixelToData(800, 0, plot, 0, 100, 0, 50)
    expect(dataX).toBeCloseTo(100)
    expect(dataY).toBeCloseTo(50)
  })

  it("中央→domain中央", () => {
    const { dataX, dataY } = cssPixelToData(400, 300, plot, 0, 100, 0, 50)
    expect(dataX).toBeCloseTo(50)
    expect(dataY).toBeCloseTo(25)
  })
})

describe("isInsidePlotRect", () => {
  const plot = { x: 60, y: 20, width: 720, height: 540 }
  it("内部はtrue", () => { expect(isInsidePlotRect(100, 100, plot)).toBe(true) })
  it("外部はfalse", () => { expect(isInsidePlotRect(0, 0, plot)).toBe(false) })
  it("境界はtrue", () => { expect(isInsidePlotRect(60, 20, plot)).toBe(true) })
})
