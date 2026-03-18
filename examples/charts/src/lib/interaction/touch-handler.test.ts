import { describe, it, expect, vi } from "vitest"
import { TouchHandler } from "./touch-handler"

describe("TouchHandler", () => {
  it("短距離+短時間はtap", () => {
    const fn = vi.fn()
    const th = new TouchHandler(fn)
    th.handlePointerDown(100, 100)
    th.handlePointerUp(102, 101)
    expect(fn).toHaveBeenCalledWith(expect.objectContaining({ type: "tap" }))
  })

  it("長距離はtapにならない", () => {
    const fn = vi.fn()
    const th = new TouchHandler(fn)
    th.handlePointerDown(100, 100)
    th.handlePointerUp(200, 200)
    expect(fn).not.toHaveBeenCalled()
  })

  it("移動距離が TAP_MAX_DISTANCE を超えるとドラッグと判定", () => {
    const fn = vi.fn()
    const th = new TouchHandler(fn)
    th.handlePointerDown(100, 100)
    // Move more than 10px
    th.handlePointerUp(115, 115)
    expect(fn).not.toHaveBeenCalled()
  })

  it("保持時間が TAP_MAX_DURATION を超えるとタップと判定されない", () => {
    const fn = vi.fn()
    const th = new TouchHandler(fn)
    // Mock Date.now to simulate long hold
    const origNow = Date.now
    let fakeTime = 1000
    Date.now = () => fakeTime
    th.handlePointerDown(100, 100)
    fakeTime = 1000 + 301 // > 300ms
    th.handlePointerUp(100, 100)
    expect(fn).not.toHaveBeenCalled()
    Date.now = origNow
  })
})
