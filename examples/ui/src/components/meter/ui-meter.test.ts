import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, cleanup } from "../../utils/test-helpers"
import "./ui-meter"

describe("ui-meter", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders with role=meter", async () => {
    el = await createElement("ui-meter")
    expect(sq(el, "[role='meter']")).not.toBeNull()
  })

  it("value reflects aria-valuenow", async () => {
    el = await createElement("ui-meter", { value: "60" })
    expect(sq(el, "[role='meter']")!.getAttribute("aria-valuenow")).toBe("60")
  })

  it("color success", async () => {
    el = await createElement("ui-meter", { color: "success" })
    const fill = sq(el, "[data-fill]")
    expect(fill!.className).toContain("bg-success")
  })

  it("shows label", async () => {
    el = await createElement("ui-meter", { label: "Storage" })
    expect(sq(el, "[data-label]")!.textContent).toBe("Storage")
  })
})
