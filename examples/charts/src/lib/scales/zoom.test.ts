import { describe, it, expect, vi } from "vitest"
import { ZoomState } from "./zoom"

describe("ZoomState", () => {
  it("初期状態は[0, 100]", () => {
    const z = new ZoomState()
    expect(z.getWindow()).toEqual({ startPct: 0, endPct: 100 })
  })

  it("zoomAt: 50%中心でfactor2 → [25, 75]", () => {
    const z = new ZoomState()
    z.zoomAt(50, 2)
    expect(z.startPct).toBeCloseTo(25)
    expect(z.endPct).toBeCloseTo(75)
  })

  it("zoomAt: アンカーが0%付近でもクランプされる", () => {
    const z = new ZoomState(0, 50)
    z.zoomAt(0, 2)
    expect(z.startPct).toBeGreaterThanOrEqual(0)
    expect(z.endPct).toBeLessThanOrEqual(100)
  })

  it("pan: 正の方向にシフト", () => {
    const z = new ZoomState(20, 80)
    z.pan(10)
    expect(z.startPct).toBeCloseTo(30)
    expect(z.endPct).toBeCloseTo(90)
  })

  it("pan: 右端でクランプ", () => {
    const z = new ZoomState(50, 100)
    z.pan(10)
    expect(z.endPct).toBe(100)
    expect(z.startPct).toBe(50)
  })

  it("pan: 左端でクランプ", () => {
    const z = new ZoomState(0, 50)
    z.pan(-10)
    expect(z.startPct).toBe(0)
    expect(z.endPct).toBe(50)
  })

  it("toDomain: パーセント→データドメイン変換", () => {
    const z = new ZoomState(25, 75)
    const { visibleMin, visibleMax } = z.toDomain(0, 1000)
    expect(visibleMin).toBeCloseTo(250)
    expect(visibleMax).toBeCloseTo(750)
  })

  it("isAtEnd: 100%のときtrue", () => {
    const z = new ZoomState(50, 100)
    expect(z.isAtEnd()).toBe(true)
  })

  it("isAtEnd: 100%未満のときfalse", () => {
    const z = new ZoomState(0, 90)
    expect(z.isAtEnd()).toBe(false)
  })

  it("setWindow が start/end を設定し clamp する", () => {
    const z = new ZoomState()
    z.setWindow(20, 80)
    expect(z.getWindow()).toEqual({ startPct: 20, endPct: 80 })
  })

  it("setWindow が範囲外の値を clamp する", () => {
    const z = new ZoomState()
    z.setWindow(-10, 110)
    expect(z.getWindow().startPct).toBeGreaterThanOrEqual(0)
    expect(z.getWindow().endPct).toBeLessThanOrEqual(100)
  })

  it("zoomAt で factor < 1 のズームアウトが正しく動作する", () => {
    const z = new ZoomState(25, 75) // 50% span
    z.zoomAt(50, 0.5) // zoom out by half
    const w = z.getWindow()
    expect(w.endPct - w.startPct).toBeGreaterThan(50)
  })

  it("onZoomChange リスナーが zoomAt で呼ばれる", () => {
    const z = new ZoomState()
    const cb = vi.fn()
    z.onZoomChange(cb)
    z.zoomAt(50, 2)
    expect(cb).toHaveBeenCalledTimes(1)
  })

  it("onZoomChange リスナーが pan で呼ばれる", () => {
    const z = new ZoomState(20, 80)
    const cb = vi.fn()
    z.onZoomChange(cb)
    z.pan(5)
    expect(cb).toHaveBeenCalledTimes(1)
  })

  it("onZoomChange リスナーが setWindow で呼ばれる", () => {
    const z = new ZoomState()
    const cb = vi.fn()
    z.onZoomChange(cb)
    z.setWindow(10, 90)
    expect(cb).toHaveBeenCalledTimes(1)
  })

  it("onZoomChange の解除が正しく動作する", () => {
    const z = new ZoomState()
    const cb = vi.fn()
    const unsub = z.onZoomChange(cb)
    unsub()
    z.zoomAt(50, 2)
    expect(cb).not.toHaveBeenCalled()
  })
})
