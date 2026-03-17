import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, cleanup } from "../../utils/test-helpers"
import "./ui-input"

describe("ui-input", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders input element", async () => {
    el = await createElement("ui-input")
    expect(sq(el, "input")).not.toBeNull()
  })

  it("default variant flat", async () => {
    el = await createElement("ui-input")
    expect(sq(el, "div")!.className).toContain("bg-default-100")
  })

  it("variant bordered", async () => {
    el = await createElement("ui-input", { variant: "bordered" })
    expect(sq(el, "div")!.className).toContain("border-2")
  })

  it("value reflects", async () => {
    el = await createElement("ui-input", { value: "hello" })
    expect((sq(el, "input") as HTMLInputElement).value).toBe("hello")
  })

  it("placeholder", async () => {
    el = await createElement("ui-input", { placeholder: "Enter..." })
    expect((sq(el, "input") as HTMLInputElement).placeholder).toBe("Enter...")
  })

  it("disabled", async () => {
    el = await createElement("ui-input", { "is-disabled": "" })
    expect((sq(el, "input") as HTMLInputElement).disabled).toBe(true)
  })

  it("invalid", async () => {
    el = await createElement("ui-input", { "is-invalid": "" })
    expect(sq(el, "input")!.getAttribute("aria-invalid")).toBe("true")
  })

  it("size sm", async () => {
    el = await createElement("ui-input", { size: "sm" })
    expect(sq(el, "div")!.className).toContain("h-8")
  })
})
