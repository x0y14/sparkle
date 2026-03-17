import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, cleanup } from "../../utils/test-helpers"
import "./ui-card"

describe("ui-card", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders container div", async () => {
    el = await createElement("ui-card")
    expect(sq(el, "div")).not.toBeNull()
  })

  it("default variant shadow", async () => {
    el = await createElement("ui-card")
    expect(sq(el, "div")!.className).toContain("shadow-md")
  })

  it("variant bordered", async () => {
    el = await createElement("ui-card", { variant: "bordered" })
    expect(sq(el, "div")!.className).toContain("border")
  })

  it("variant flat", async () => {
    el = await createElement("ui-card", { variant: "flat" })
    const cls = sq(el, "div")!.className
    expect(cls).toContain("bg-content1")
    expect(cls).not.toContain("shadow-md")
  })

  it("pressable adds cursor-pointer", async () => {
    el = await createElement("ui-card", { "is-pressable": "" })
    expect(sq(el, "div")!.className).toContain("cursor-pointer")
  })

  it("pressable has role=button", async () => {
    el = await createElement("ui-card", { "is-pressable": "" })
    expect(sq(el, "div")!.getAttribute("role")).toBe("button")
  })

  it("disabled state", async () => {
    el = await createElement("ui-card", { "is-disabled": "" })
    expect(sq(el, "div")!.className).toContain("opacity-50")
  })

  it("has header slot", async () => {
    el = await createElement("ui-card")
    const slots = el.shadowRoot!.querySelectorAll("slot")
    const names = Array.from(slots).map(s => s.getAttribute("name")).filter(Boolean)
    expect(names).toContain("header")
  })

  it("has footer slot", async () => {
    el = await createElement("ui-card")
    const slots = el.shadowRoot!.querySelectorAll("slot")
    const names = Array.from(slots).map(s => s.getAttribute("name")).filter(Boolean)
    expect(names).toContain("footer")
  })
})
