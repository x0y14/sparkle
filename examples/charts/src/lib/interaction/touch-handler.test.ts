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
})
