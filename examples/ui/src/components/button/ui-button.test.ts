import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, cleanup } from "../../utils/test-helpers"
import "./ui-button"

describe("ui-button", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders button", async () => {
    el = await createElement("ui-button")
    expect(sq(el, "button")).not.toBeNull()
  })

  it("default solid+primary", async () => {
    el = await createElement("ui-button")
    const cls = sq(el, "button")!.className
    expect(cls).toContain("bg-primary")
    expect(cls).toContain("text-white")
  })

  it("variant bordered + color danger", async () => {
    el = await createElement("ui-button", { variant: "bordered", color: "danger" })
    const cls = sq(el, "button")!.className
    expect(cls).toContain("border-danger")
    expect(cls).toContain("text-danger")
  })

  it("variant flat + color success", async () => {
    el = await createElement("ui-button", { variant: "flat", color: "success" })
    expect(sq(el, "button")!.className).toContain("bg-success-50")
  })

  it("variant ghost + color primary", async () => {
    el = await createElement("ui-button", { variant: "ghost", color: "primary" })
    expect(sq(el, "button")!.className).toContain("border-primary")
  })

  it("size sm", async () => {
    el = await createElement("ui-button", { size: "sm" })
    const cls = sq(el, "button")!.className
    expect(cls).toContain("h-8")
    expect(cls).toContain("text-xs")
  })

  it("size lg", async () => {
    el = await createElement("ui-button", { size: "lg" })
    const cls = sq(el, "button")!.className
    expect(cls).toContain("h-12")
    expect(cls).toContain("text-base")
  })

  it("disabled", async () => {
    el = await createElement("ui-button", { "is-disabled": "" })
    const btn = sq(el, "button") as HTMLButtonElement
    expect(btn.disabled).toBe(true)
    expect(btn.className).toContain("opacity-50")
  })

  it("loading shows spinner", async () => {
    el = await createElement("ui-button", { "is-loading": "" })
    expect(sq(el, "svg.animate-spin")).not.toBeNull()
    expect(sq(el, "button")!.getAttribute("aria-busy")).toBe("true")
  })

  it("emits press on click", async () => {
    el = await createElement("ui-button")
    let fired = false
    el.addEventListener("press", () => { fired = true })
    ;(sq(el, "button") as HTMLButtonElement).click()
    await new Promise((r) => setTimeout(r, 0))
    expect(fired).toBe(true)
  })

  it("no press when disabled", async () => {
    el = await createElement("ui-button", { "is-disabled": "" })
    let fired = false
    el.addEventListener("press", () => { fired = true })
    ;(sq(el, "button") as HTMLButtonElement).click()
    await new Promise((r) => setTimeout(r, 0))
    expect(fired).toBe(false)
  })

  it("full-width", async () => {
    el = await createElement("ui-button", { "full-width": "" })
    expect(sq(el, "button")!.className).toContain("w-full")
  })

  it("icon-only size md", async () => {
    el = await createElement("ui-button", { "is-icon-only": "" })
    const cls = sq(el, "button")!.className
    expect(cls).toContain("w-10")
    expect(cls).toContain("h-10")
  })

  it("radius full", async () => {
    el = await createElement("ui-button", { radius: "full" })
    expect(sq(el, "button")!.className).toContain("rounded-full")
  })
})
