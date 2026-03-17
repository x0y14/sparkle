import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, cleanup } from "../../utils/test-helpers"
import "./ui-textfield"

describe("ui-textfield", () => {
  let el: HTMLElement
  afterEach(() => { if (el) cleanup(el) })

  it("renders container div", async () => {
    el = await createElement("ui-textfield")
    expect(sq(el, "div")).not.toBeNull()
  })

  it("shows label", async () => {
    el = await createElement("ui-textfield", { label: "Email" })
    expect(sq(el, "label")!.textContent).toBe("Email")
  })

  it("shows description", async () => {
    el = await createElement("ui-textfield", { description: "Enter your email" })
    expect(sq(el, "p")!.textContent).toBe("Enter your email")
  })

  it("shows error when invalid", async () => {
    el = await createElement("ui-textfield", { "is-invalid": "", "error-message": "Required" })
    const alert = sq(el, "[role='alert']")
    expect(alert).not.toBeNull()
    expect(alert!.textContent).toBe("Required")
  })
})
