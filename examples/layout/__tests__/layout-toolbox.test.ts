import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, sqa, cleanup } from "../src/utils/test-helpers"
import "../src/components/layout-toolbox"

describe("layout-toolbox", () => {
  let el: HTMLElement
  afterEach(() => {
    if (el) cleanup(el)
  })

  it("renders four toolbox entries", async () => {
    el = await createElement("layout-toolbox")
    const entries = sqa(el, "[data-toolbox-type]")
    expect(entries).toHaveLength(4)
  })

  it("renders vertical entry", async () => {
    el = await createElement("layout-toolbox")
    const entry = sq(el, "[data-toolbox-type='vertical']")
    expect(entry).not.toBeNull()
    expect(entry!.textContent).toContain("Vertical")
  })

  it("renders horizontal entry", async () => {
    el = await createElement("layout-toolbox")
    const entry = sq(el, "[data-toolbox-type='horizontal']")
    expect(entry).not.toBeNull()
    expect(entry!.textContent).toContain("Horizontal")
  })

  it("renders item entry", async () => {
    el = await createElement("layout-toolbox")
    const entry = sq(el, "[data-toolbox-type='item']")
    expect(entry).not.toBeNull()
    expect(entry!.textContent).toContain("Item")
  })

  it("renders spacer entry", async () => {
    el = await createElement("layout-toolbox")
    const entry = sq(el, "[data-toolbox-type='spacer']")
    expect(entry).not.toBeNull()
    expect(entry!.textContent).toContain("Spacer")
  })

  it("renders drag handle", async () => {
    el = await createElement("layout-toolbox")
    const handle = sq(el, "[data-toolbox-handle]")
    expect(handle).not.toBeNull()
  })
})
