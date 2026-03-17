import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, cleanup } from "../../utils/test-helpers"
import "./ui-skeleton"

describe("ui-skeleton", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders with aria-busy=true by default", async () => {
    el = await createElement("ui-skeleton")
    expect(sq(el, "[aria-busy='true']")).not.toBeNull()
  })

  it("has animate-pulse when not loaded", async () => {
    el = await createElement("ui-skeleton")
    const div = sq(el, "div")
    expect(div!.className).toContain("animate-pulse")
  })

  it("removes animate-pulse when loaded", async () => {
    el = await createElement("ui-skeleton", { "is-loaded": "" })
    const div = sq(el, "div")
    expect(div!.className).not.toContain("animate-pulse")
  })

  it("aria-busy=false when loaded", async () => {
    el = await createElement("ui-skeleton", { "is-loaded": "" })
    expect(sq(el, "[aria-busy='false']")).not.toBeNull()
  })
})
