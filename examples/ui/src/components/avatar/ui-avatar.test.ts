import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, cleanup } from "../../utils/test-helpers"
import "./ui-avatar"

describe("ui-avatar", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders container div", async () => {
    el = await createElement("ui-avatar")
    expect(sq(el, "div")).not.toBeNull()
  })

  it("shows initials from name", async () => {
    el = await createElement("ui-avatar", { name: "John Doe" })
    const span = sq(el, "span")
    expect(span!.textContent!.trim()).toBe("JD")
  })

  it("shows image when src provided", async () => {
    el = await createElement("ui-avatar", { src: "https://example.com/avatar.jpg", name: "John" })
    expect(sq(el, "img")).not.toBeNull()
  })

  it("default size md", async () => {
    el = await createElement("ui-avatar")
    expect(sq(el, "div")!.className).toContain("w-10")
  })

  it("size sm", async () => {
    el = await createElement("ui-avatar", { size: "sm" })
    expect(sq(el, "div")!.className).toContain("w-8")
  })

  it("radius md", async () => {
    el = await createElement("ui-avatar", { radius: "md" })
    expect(sq(el, "div")!.className).toContain("rounded-md")
  })

  it("bordered", async () => {
    el = await createElement("ui-avatar", { "is-bordered": "" })
    expect(sq(el, "div")!.className).toContain("ring-2")
  })
})
