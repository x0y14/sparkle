import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, cleanup } from "../../utils/test-helpers"
import "./ui-breadcrumbs"
import "./ui-breadcrumbs-item"

describe("ui-breadcrumbs", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders nav with aria-label", async () => {
    el = await createElement("ui-breadcrumbs")
    expect(sq(el, "nav")!.getAttribute("aria-label")).toBe("Breadcrumbs")
  })

  it("renders ol element", async () => {
    el = await createElement("ui-breadcrumbs")
    expect(sq(el, "ol")).not.toBeNull()
  })
})

describe("ui-breadcrumbs-item", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders li element", async () => {
    el = await createElement("ui-breadcrumbs-item")
    expect(sq(el, "li")).not.toBeNull()
  })

  it("renders link when href provided", async () => {
    el = await createElement("ui-breadcrumbs-item", { href: "/home" })
    expect(sq(el, "a")!.getAttribute("href")).toBe("/home")
  })

  it("renders span when is-current", async () => {
    el = await createElement("ui-breadcrumbs-item", { "is-current": "" })
    const span = sq(el, "[aria-current='page']")
    expect(span).not.toBeNull()
  })
})
