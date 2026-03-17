import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, cleanup } from "../../utils/test-helpers"
import "./ui-progress-circle"

describe("ui-progress-circle", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders svg with role=progressbar", async () => {
    el = await createElement("ui-progress-circle")
    expect(sq(el, "[role='progressbar']")).not.toBeNull()
    expect(sq(el, "svg")).not.toBeNull()
  })

  it("value reflects aria-valuenow", async () => {
    el = await createElement("ui-progress-circle", { value: "75" })
    expect(sq(el, "[role='progressbar']")!.getAttribute("aria-valuenow")).toBe("75")
  })

  it("size md default", async () => {
    el = await createElement("ui-progress-circle")
    const svg = sq(el, "svg")
    expect(svg!.getAttribute("class")).toContain("w-12")
  })

  it("color success", async () => {
    el = await createElement("ui-progress-circle", { color: "success" })
    const circle = sq(el, "circle:last-child")
    expect(circle!.getAttribute("class")).toContain("text-success")
  })
})
