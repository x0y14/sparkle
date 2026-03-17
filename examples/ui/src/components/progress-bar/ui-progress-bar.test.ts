import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, cleanup } from "../../utils/test-helpers"
import "./ui-progress-bar"

describe("ui-progress-bar", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders with role=progressbar", async () => {
    el = await createElement("ui-progress-bar")
    expect(sq(el, "[role='progressbar']")).not.toBeNull()
  })

  it("value reflects aria-valuenow", async () => {
    el = await createElement("ui-progress-bar", { value: "50" })
    const bar = sq(el, "[role='progressbar']")!
    expect(bar.getAttribute("aria-valuenow")).toBe("50")
  })

  it("calculates percentage width", async () => {
    el = await createElement("ui-progress-bar", { value: "75", "max-value": "100" })
    const fill = sq(el, "[data-fill]") as HTMLElement
    expect(fill.style.width).toBe("75%")
  })

  it("indeterminate mode", async () => {
    el = await createElement("ui-progress-bar", { "is-indeterminate": "" })
    const fill = sq(el, "[data-fill]")
    expect(fill!.className).toContain("animate-")
  })

  it("color success", async () => {
    el = await createElement("ui-progress-bar", { color: "success" })
    const fill = sq(el, "[data-fill]")
    expect(fill!.className).toContain("bg-success")
  })

  it("size sm", async () => {
    el = await createElement("ui-progress-bar", { size: "sm" })
    const track = sq(el, "[data-track]")
    expect(track!.className).toContain("h-1")
  })

  it("shows label", async () => {
    el = await createElement("ui-progress-bar", { label: "Progress", value: "30" })
    expect(sq(el, "[data-label]")!.textContent).toBe("Progress")
  })
})
