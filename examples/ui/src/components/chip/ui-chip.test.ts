import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, cleanup } from "../../utils/test-helpers"
import "./ui-chip"

describe("ui-chip", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders span element", async () => {
    el = await createElement("ui-chip")
    expect(sq(el, "span")).not.toBeNull()
  })

  it("default solid+default color", async () => {
    el = await createElement("ui-chip")
    expect(sq(el, "span")!.className).toContain("bg-default-200")
  })

  it("variant flat + color primary", async () => {
    el = await createElement("ui-chip", { variant: "flat", color: "primary" })
    expect(sq(el, "span")!.className).toContain("bg-primary-50")
  })

  it("variant bordered + color danger", async () => {
    el = await createElement("ui-chip", { variant: "bordered", color: "danger" })
    expect(sq(el, "span")!.className).toContain("border-danger")
  })

  it("size sm", async () => {
    el = await createElement("ui-chip", { size: "sm" })
    expect(sq(el, "span")!.className).toContain("h-5")
  })

  it("radius md", async () => {
    el = await createElement("ui-chip", { radius: "md" })
    expect(sq(el, "span")!.className).toContain("rounded-md")
  })

  it("no close button by default", async () => {
    el = await createElement("ui-chip")
    expect(sq(el, "button")).toBeNull()
  })

  it("close button when is-closeable", async () => {
    el = await createElement("ui-chip", { "is-closeable": "" })
    expect(sq(el, "button")).not.toBeNull()
  })

  it("emits close event on button click", async () => {
    el = await createElement("ui-chip", { "is-closeable": "" })
    let fired = false
    el.addEventListener("close", () => { fired = true })
    const btn = sq(el, "button") as HTMLButtonElement
    btn.click()
    await new Promise((r) => setTimeout(r, 0))
    expect(fired).toBe(true)
  })
})
