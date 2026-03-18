import { describe, it, expect } from "vitest"
import { sampleOHLC } from "./ohlc-sampling"
import { createAccessor } from "../data/accessor"

describe("sampleOHLC", () => {
  const data = Array.from({ length: 100 }, (_, i) => ({
    time: i * 1000,
    open: 100 + i,
    high: 110 + i,
    low: 90 + i,
    close: 105 + i,
  }))
  const acc = createAccessor(data)

  it("target >= countなら全データ返す", () => {
    expect(sampleOHLC(acc, 200)).toHaveLength(100)
  })

  it("出力長がtargetCountと一致", () => {
    expect(sampleOHLC(acc, 10)).toHaveLength(10)
  })

  it("open=最初のopen, close=最後のclose", () => {
    const result = sampleOHLC(acc, 10)
    expect(result[0].open).toBe(data[0].open)
    expect(result[0].close).toBe(data[9].close)
  })

  it("high=バケット内最大high, low=バケット内最小low", () => {
    const result = sampleOHLC(acc, 10)
    expect(result[0].high).toBe(Math.max(...data.slice(0, 10).map(d => d.high)))
    expect(result[0].low).toBe(Math.min(...data.slice(0, 10).map(d => d.low)))
  })
})
