import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, sqa, cleanup } from "../src/utils/test-helpers"
import "../src/components/layout-preview"

describe("layout-preview", () => {
  let el: HTMLElement
  afterEach(() => {
    if (el) cleanup(el)
  })

  it("shows placeholder when no content", async () => {
    el = await createElement("layout-preview")
    expect(sq(el, "p")!.textContent).toContain("Preview will appear here")
  })

  it("renders valid layout item", async () => {
    el = await createElement("layout-preview")
    ;(el as any).content = '{"type":"item","id":"a"}'
    await new Promise((r) => setTimeout(r, 0))
    const item = sq(el, "[data-node-type='item']")
    expect(item).not.toBeNull()
    expect(item!.textContent).toContain("a")
  })

  it("renders valid nested layout", async () => {
    el = await createElement("layout-preview")
    ;(el as any).content = JSON.stringify({
      type: "layout",
      direction: "horizontal",
      children: [
        { type: "item", id: "x" },
        { type: "item", id: "y" },
      ],
    })
    await new Promise((r) => setTimeout(r, 0))
    const layout = sq(el, "[data-node-type='layout']")
    expect(layout).not.toBeNull()
    const items = sqa(el, "[data-node-type='item']")
    expect(items.length).toBe(2)
  })

  it("shows error for invalid JSON", async () => {
    el = await createElement("layout-preview")
    ;(el as any).content = "{invalid json"
    await new Promise((r) => setTimeout(r, 0))
    const errorEl = sq(el, "[data-error]")
    expect(errorEl).not.toBeNull()
    expect(errorEl!.textContent).toContain("{invalid json")
  })

  it("shows error for valid JSON that is not a LayoutNode", async () => {
    el = await createElement("layout-preview")
    ;(el as any).content = '{"foo":"bar"}'
    await new Promise((r) => setTimeout(r, 0))
    const errorEl = sq(el, "[data-error]")
    expect(errorEl).not.toBeNull()
  })

  it("renders items with data-path attributes", async () => {
    el = await createElement("layout-preview")
    ;(el as any).content = JSON.stringify({
      type: "layout", direction: "vertical",
      children: [{ type: "item", id: "a" }, { type: "item", id: "b" }],
    })
    await new Promise((r) => setTimeout(r, 0))
    expect(sq(el, "[data-path='0']")).not.toBeNull()
    expect(sq(el, "[data-path='1']")).not.toBeNull()
  })

  it("renders layouts with data-path attributes", async () => {
    el = await createElement("layout-preview")
    ;(el as any).content = JSON.stringify({
      type: "layout", direction: "vertical",
      children: [{ type: "item", id: "a" }],
    })
    await new Promise((r) => setTimeout(r, 0))
    expect(sq(el, "[data-node-type='layout'][data-path='']")).not.toBeNull()
  })

  it("emits node-select on item click", async () => {
    el = await createElement("layout-preview")
    ;(el as any).content = JSON.stringify({
      type: "layout", direction: "vertical",
      children: [{ type: "item", id: "a" }],
    })
    await new Promise((r) => setTimeout(r, 0))
    let received: any
    el.addEventListener("node-select", ((e: CustomEvent) => {
      received = e.detail
    }) as EventListener)
    const item = sq(el, "[data-node-id='a']") as HTMLElement
    item.click()
    await new Promise((r) => setTimeout(r, 0))
    expect(received).not.toBeUndefined()
    expect(received.path).toBe("0")
    expect(received.nodeType).toBe("item")
    expect(received.nodeId).toBe("a")
  })

  it("emits node-select with width and height on item click", async () => {
    el = await createElement("layout-preview", {
      content: JSON.stringify({ type: "item", id: "a", width: "100px", height: "50px" }),
    })
    let received: any
    el.addEventListener("node-select", ((e: CustomEvent) => { received = e.detail }) as EventListener)
    const item = sq(el, "[data-node-id='a']") as HTMLElement
    item.click()
    await new Promise((r) => setTimeout(r, 0))
    expect(received.itemWidth).toBe("100px")
    expect(received.itemHeight).toBe("50px")
  })

  it("emits node-select on layout click", async () => {
    el = await createElement("layout-preview")
    ;(el as any).content = JSON.stringify({
      type: "layout", direction: "horizontal",
      children: [{ type: "item", id: "a" }],
    })
    await new Promise((r) => setTimeout(r, 0))
    let received: any
    el.addEventListener("node-select", ((e: CustomEvent) => {
      received = e.detail
    }) as EventListener)
    const layout = sq(el, "[data-node-type='layout']") as HTMLElement
    layout.click()
    await new Promise((r) => setTimeout(r, 0))
    expect(received.path).toBe("")
    expect(received.nodeType).toBe("layout")
    expect(received.direction).toBe("horizontal")
  })

  it("emits node-select with null path on deselect", async () => {
    el = await createElement("layout-preview")
    ;(el as any).content = JSON.stringify({
      type: "layout", direction: "vertical",
      children: [{ type: "item", id: "a" }],
    })
    await new Promise((r) => setTimeout(r, 0))
    let received: any
    el.addEventListener("node-select", ((e: CustomEvent) => {
      received = e.detail
    }) as EventListener)
    const item = sq(el, "[data-node-id='a']") as HTMLElement
    item.click()
    await new Promise((r) => setTimeout(r, 0))
    expect(received.path).toBe("0")
    item.click()
    await new Promise((r) => setTimeout(r, 0))
    expect(received.path).toBeNull()
  })

  it("updates when content changes", async () => {
    el = await createElement("layout-preview")
    ;(el as any).content = '{"type":"item","id":"first"}'
    await new Promise((r) => setTimeout(r, 0))
    expect(sq(el, "[data-node-id='first']")).not.toBeNull()
    ;(el as any).content = '{"type":"item","id":"second"}'
    await new Promise((r) => setTimeout(r, 0))
    expect(sq(el, "[data-node-id='second']")).not.toBeNull()
    expect(sq(el, "[data-node-id='first']")).toBeNull()
  })
})
