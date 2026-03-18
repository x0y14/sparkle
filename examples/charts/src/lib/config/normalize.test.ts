import { describe, it, expect } from "vitest"
import { normalizeConfig } from "./normalize"
import type { ChartConfig } from "../types"
import { lightTheme } from "./themes"

describe("normalizeConfig", () => {
  const minConfig: ChartConfig = {
    type: "line",
    series: [{ data: [{ x: 0, y: 10 }, { x: 100, y: 50 }] }],
  }

  it("最小設定でエラーにならず全フィールドが確定する", () => {
    const n = normalizeConfig(minConfig)
    expect(n.type).toBe("line")
    expect(n.series).toHaveLength(1)
    expect(n.series[0].color).toBe(lightTheme.palette[0])
    expect(n.series[0].label).toBe("Series 1")
    expect(n.series[0].lineWidth).toBe(2)
    expect(n.xAxis.min).toBe(0)
    expect(n.xAxis.max).toBe(100)
    expect(n.yAxis.min).toBe(10)
    expect(n.yAxis.max).toBe(50)
    expect(n.margins).toEqual({ top: 20, right: 20, bottom: 40, left: 60 })
    expect(n.theme).toBe(lightTheme)
    expect(n.zoom).toBe(true)
    expect(n.tooltip).toBe(true)
    expect(n.legend).toBe(true)
  })

  it("入力オブジェクトは変更されない（非破壊）", () => {
    const cfg = { ...minConfig, series: [{ ...minConfig.series[0] }] }
    const before = JSON.stringify(cfg)
    normalizeConfig(cfg)
    expect(JSON.stringify(cfg)).toBe(before)
  })

  it("冪等: 同じ入力から同じ出力", () => {
    const a = normalizeConfig(minConfig)
    const b = normalizeConfig(minConfig)
    expect(a.xAxis.min).toBe(b.xAxis.min)
    expect(a.series[0].color).toBe(b.series[0].color)
  })

  it("明示軸バウンドが自動計算を上書き", () => {
    const cfg: ChartConfig = { ...minConfig, yAxis: { min: -100, max: 200 } }
    const n = normalizeConfig(cfg)
    expect(n.yAxis.min).toBe(-100)
    expect(n.yAxis.max).toBe(200)
  })

  it("データなしシリーズでもエラーにならない", () => {
    const cfg: ChartConfig = { type: "line", series: [{ data: [] }] }
    const n = normalizeConfig(cfg)
    expect(n.xAxis.min).toBe(0)
    expect(n.xAxis.max).toBe(1)
  })
})
