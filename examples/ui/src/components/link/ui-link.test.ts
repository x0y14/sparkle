import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, cleanup } from "../../utils/test-helpers"
import "./ui-link"

describe("ui-link", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders anchor element", async () => {
    el = await createElement("ui-link")
    expect(sq(el, "a")).not.toBeNull()
  })

  it("href attribute", async () => {
    el = await createElement("ui-link", { href: "/about" })
    expect(sq(el, "a")!.getAttribute("href")).toBe("/about")
  })

  it("default color primary", async () => {
    el = await createElement("ui-link")
    expect(sq(el, "a")!.className).toContain("text-primary")
  })

  it("color danger", async () => {
    el = await createElement("ui-link", { color: "danger" })
    expect(sq(el, "a")!.className).toContain("text-danger")
  })

  it("external link", async () => {
    el = await createElement("ui-link", { "is-external": "", href: "https://example.com" })
    const a = sq(el, "a")!
    expect(a.getAttribute("target")).toBe("_blank")
    expect(sq(el, "svg")).not.toBeNull()
  })

  it("disabled state", async () => {
    el = await createElement("ui-link", { "is-disabled": "" })
    const a = sq(el, "a")!
    expect(a.className).toContain("opacity-50")
    expect(a.getAttribute("aria-disabled")).toBe("true")
  })

  it("underline hover", async () => {
    el = await createElement("ui-link", { underline: "hover" })
    expect(sq(el, "a")!.className).toContain("hover:underline")
  })

  it("underline always", async () => {
    el = await createElement("ui-link", { underline: "always" })
    const cls = sq(el, "a")!.className
    expect(cls).toContain("underline")
  })
})
