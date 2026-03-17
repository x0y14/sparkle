import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, cleanup } from "../../utils/test-helpers"
import "./ui-spinner"

describe("ui-spinner", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders with role=status", async () => {
    el = await createElement("ui-spinner")
    expect(sq(el, "[role='status']")).not.toBeNull()
  })

  it("default size md", async () => {
    el = await createElement("ui-spinner")
    const svg = sq(el, "svg")
    expect(svg).not.toBeNull()
    expect(svg!.getAttribute("class")).toContain("w-8")
    expect(svg!.getAttribute("class")).toContain("h-8")
  })

  it("size sm", async () => {
    el = await createElement("ui-spinner", { size: "sm" })
    const svg = sq(el, "svg")
    expect(svg!.getAttribute("class")).toContain("w-5")
    expect(svg!.getAttribute("class")).toContain("h-5")
  })

  it("size lg", async () => {
    el = await createElement("ui-spinner", { size: "lg" })
    const svg = sq(el, "svg")
    expect(svg!.getAttribute("class")).toContain("w-10")
    expect(svg!.getAttribute("class")).toContain("h-10")
  })

  it("color danger", async () => {
    el = await createElement("ui-spinner", { color: "danger" })
    const svg = sq(el, "svg")
    expect(svg!.getAttribute("class")).toContain("text-danger")
  })

  it("aria-label from label prop", async () => {
    el = await createElement("ui-spinner", { label: "Loading data" })
    expect(sq(el, "[role='status']")!.getAttribute("aria-label")).toBe("Loading data")
  })
})
