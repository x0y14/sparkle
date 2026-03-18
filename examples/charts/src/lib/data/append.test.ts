import { describe, it, expect } from "vitest"
import { appendSeriesData } from "./append"
import { makeNormalizedSeries } from "../test-helpers"

describe("appendSeriesData", () => {
  it("PointObject[] に新データを追加する", () => {
    const series = makeNormalizedSeries([{ data: [{ x: 0, y: 1 }, { x: 1, y: 2 }], label: "A" }], "line")[0]
    const result = appendSeriesData(series, [{ x: 2, y: 3 }])
    expect(result.accessor.getCount()).toBe(3)
    expect(result.accessor.getX(2)).toBe(2)
    expect(result.accessor.getY(2)).toBe(3)
  })

  it("バウンドを再計算する", () => {
    const series = makeNormalizedSeries([{ data: [{ x: 0, y: 0 }, { x: 1, y: 1 }], label: "A" }], "line")[0]
    const result = appendSeriesData(series, [{ x: 2, y: 5 }])
    expect(result.rawBoundsX.max).toBe(2)
    expect(result.rawBoundsY.max).toBe(5)
  })

  it("元のシリーズを変更しない", () => {
    const series = makeNormalizedSeries([{ data: [{ x: 0, y: 0 }], label: "A" }], "line")[0]
    const origCount = series.accessor.getCount()
    appendSeriesData(series, [{ x: 1, y: 1 }])
    expect(series.accessor.getCount()).toBe(origCount)
  })
})
