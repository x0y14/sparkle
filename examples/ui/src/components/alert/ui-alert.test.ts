import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, cleanup } from "../../utils/test-helpers"
import "./ui-alert"

describe("ui-alert", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders with role=alert", async () => {
    el = await createElement("ui-alert")
    expect(sq(el, "[role='alert']")).not.toBeNull()
  })

  it("shows title", async () => {
    el = await createElement("ui-alert", { title: "Warning!" })
    const titleEl = sq(el, "[data-title]")
    expect(titleEl!.textContent).toBe("Warning!")
  })

  it("default variant flat + default color", async () => {
    el = await createElement("ui-alert")
    expect(sq(el, "[role='alert']")!.className).toContain("bg-default-100")
  })

  it("variant solid + color danger", async () => {
    el = await createElement("ui-alert", { variant: "solid", color: "danger" })
    expect(sq(el, "[role='alert']")!.className).toContain("bg-danger")
  })

  it("variant bordered + color success", async () => {
    el = await createElement("ui-alert", { variant: "bordered", color: "success" })
    expect(sq(el, "[role='alert']")!.className).toContain("border-success")
  })

  it("no close button by default", async () => {
    el = await createElement("ui-alert")
    expect(sq(el, "button")).toBeNull()
  })

  it("close button when is-closeable", async () => {
    el = await createElement("ui-alert", { "is-closeable": "" })
    expect(sq(el, "button")).not.toBeNull()
  })

  it("emits close on button click", async () => {
    el = await createElement("ui-alert", { "is-closeable": "" })
    let fired = false
    el.addEventListener("close", () => { fired = true })
    ;(sq(el, "button") as HTMLButtonElement).click()
    await new Promise((r) => setTimeout(r, 0))
    expect(fired).toBe(true)
  })
})
