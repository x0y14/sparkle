import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, sqa, cleanup } from "../../utils/test-helpers"
import "./ui-alert-dialog"

describe("ui-alert-dialog", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders dialog", async () => {
    el = await createElement("ui-alert-dialog")
    expect(sq(el, "dialog")).not.toBeNull()
  })

  it("not visible by default", async () => {
    el = await createElement("ui-alert-dialog")
    const dialog = sq(el, "dialog") as HTMLElement
    expect(dialog.className).toContain("hidden")
  })

  it("shows title", async () => {
    el = await createElement("ui-alert-dialog", { "is-open": "", title: "Confirm" })
    const h2 = sq(el, "h2")
    expect(h2).not.toBeNull()
    expect(h2!.textContent!.trim()).toBe("Confirm")
  })

  it("shows description", async () => {
    el = await createElement("ui-alert-dialog", { "is-open": "", description: "Are you sure?" })
    const p = sq(el, "p")
    expect(p).not.toBeNull()
    expect(p!.textContent!.trim()).toBe("Are you sure?")
  })

  it("has role alertdialog", async () => {
    el = await createElement("ui-alert-dialog", { "is-open": "" })
    const content = sq(el, "[role='alertdialog']")
    expect(content).not.toBeNull()
  })
})
