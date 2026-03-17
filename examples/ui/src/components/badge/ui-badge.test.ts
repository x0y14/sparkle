import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, cleanup } from "../../utils/test-helpers"
import "./ui-badge"

describe("ui-badge", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders badge span", async () => {
    el = await createElement("ui-badge")
    expect(sq(el, "span")).not.toBeNull()
  })

  it("shows content text", async () => {
    el = await createElement("ui-badge", { content: "5" })
    expect(sq(el, "span")!.textContent!.trim()).toBe("5")
  })

  it("default color danger", async () => {
    el = await createElement("ui-badge")
    expect(sq(el, "span")!.className).toContain("bg-danger")
  })

  it("color primary", async () => {
    el = await createElement("ui-badge", { color: "primary" })
    expect(sq(el, "span")!.className).toContain("bg-primary")
  })

  it("invisible hides badge", async () => {
    el = await createElement("ui-badge", { "is-invisible": "" })
    const span = sq(el, "span") as HTMLElement
    expect(span.style.display).toBe("none")
  })

  it("placement bottom-right", async () => {
    el = await createElement("ui-badge", { placement: "bottom-right" })
    const span = sq(el, "span")
    expect(span!.className).toContain("bottom-0")
    expect(span!.className).toContain("right-0")
  })

  it("size sm", async () => {
    el = await createElement("ui-badge", { size: "sm" })
    const span = sq(el, "span")
    expect(span!.className).toContain("min-w-4")
    expect(span!.className).toContain("h-4")
  })
})
