import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, cleanup } from "../../utils/test-helpers"
import "./ui-tag"

describe("ui-tag", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders span element", async () => {
    el = await createElement("ui-tag")
    expect(sq(el, "span")).not.toBeNull()
  })

  it("default solid+default color", async () => {
    el = await createElement("ui-tag")
    expect(sq(el, "span")!.className).toContain("bg-default-200")
  })

  it("no close button by default", async () => {
    el = await createElement("ui-tag")
    expect(sq(el, "button")).toBeNull()
  })

  it("close button when is-closeable", async () => {
    el = await createElement("ui-tag", { "is-closeable": "" })
    expect(sq(el, "button")).not.toBeNull()
  })

  it("emits remove event on button click", async () => {
    el = await createElement("ui-tag", { "is-closeable": "" })
    let fired = false
    el.addEventListener("remove", () => { fired = true })
    ;(sq(el, "button") as HTMLButtonElement).click()
    await new Promise((r) => setTimeout(r, 0))
    expect(fired).toBe(true)
  })
})
