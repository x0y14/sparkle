import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, cleanup } from "../../utils/test-helpers"
import "./ui-close-button"

describe("ui-close-button", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders button with aria-label=Close", async () => {
    el = await createElement("ui-close-button")
    expect(sq(el, "button")!.getAttribute("aria-label")).toBe("Close")
  })

  it("size md", async () => {
    el = await createElement("ui-close-button")
    expect(sq(el, "button")!.className).toContain("w-8")
    expect(sq(el, "button")!.className).toContain("h-8")
  })

  it("size sm", async () => {
    el = await createElement("ui-close-button", { size: "sm" })
    expect(sq(el, "button")!.className).toContain("w-6")
    expect(sq(el, "button")!.className).toContain("h-6")
  })

  it("disabled", async () => {
    el = await createElement("ui-close-button", { "is-disabled": "" })
    expect((sq(el, "button") as HTMLButtonElement).disabled).toBe(true)
  })

  it("emits press on click", async () => {
    el = await createElement("ui-close-button")
    let fired = false
    el.addEventListener("press", () => { fired = true })
    ;(sq(el, "button") as HTMLButtonElement).click()
    await new Promise((r) => setTimeout(r, 0))
    expect(fired).toBe(true)
  })
})
