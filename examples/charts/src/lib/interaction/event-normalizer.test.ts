import { describe, it, expect } from "vitest"
import { normalizeWheelDelta } from "./event-normalizer"

describe("normalizeWheelDelta", () => {
  it("PIXEL modeはそのまま（クランプあり）", () => {
    const e = { deltaY: 100, deltaMode: 0 } as WheelEvent
    expect(normalizeWheelDelta(e)).toBe(100)
  })

  it("LINE modeは40倍", () => {
    const e = { deltaY: 3, deltaMode: 1 } as WheelEvent
    expect(normalizeWheelDelta(e)).toBe(120)
  })

  it("PAGE modeは800倍でクランプ300", () => {
    const e = { deltaY: 1, deltaMode: 2 } as WheelEvent
    expect(normalizeWheelDelta(e)).toBe(300)
  })

  it("負の値は-300でクランプ", () => {
    const e = { deltaY: -1, deltaMode: 2 } as WheelEvent
    expect(normalizeWheelDelta(e)).toBe(-300)
  })
})
