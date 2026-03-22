import { describe, it, expect, afterEach } from "vitest"
import { createElement, sq, cleanup } from "../src/utils/test-helpers"
import "../src/components/layout-node-inspector"

describe("layout-node-inspector", () => {
  let el: HTMLElement
  afterEach(() => {
    if (el) cleanup(el)
  })

  it("node-type空のとき非表示", async () => {
    el = await createElement("layout-node-inspector")
    expect(sq(el, "[data-inspector]")).toBeNull()
  })

  it("item選択時: type, id表示", async () => {
    el = await createElement("layout-node-inspector", {
      "node-type": "item", "node-id": "hello",
    })
    expect(sq(el, "[data-field='type']")!.textContent).toContain("item")
    expect((sq(el, "[data-field='id'] input") as HTMLInputElement).value).toBe("hello")
  })

  it("layout選択時: type, direction表示", async () => {
    el = await createElement("layout-node-inspector", {
      "node-type": "layout", "node-direction": "vertical",
    })
    expect(sq(el, "[data-field='type']")!.textContent).toContain("layout")
    expect((sq(el, "[data-field='direction'] input") as HTMLInputElement).value).toBe("vertical")
  })

  it("id変更でid-changeイベント発火", async () => {
    el = await createElement("layout-node-inspector", {
      "node-type": "item", "node-id": "old",
    })
    let received: string | undefined
    el.addEventListener("id-change", ((e: CustomEvent) => {
      received = e.detail.id
    }) as EventListener)
    const input = sq(el, "[data-field='id'] input") as HTMLInputElement
    input.value = "new-id"
    input.dispatchEvent(new Event("change", { bubbles: true }))
    await new Promise((r) => setTimeout(r, 0))
    expect(received).toBe("new-id")
  })

  it("direction変更でdirection-changeイベント発火", async () => {
    el = await createElement("layout-node-inspector", {
      "node-type": "layout", "node-direction": "vertical",
    })
    let received: string | undefined
    el.addEventListener("direction-change", ((e: CustomEvent) => {
      received = e.detail.direction
    }) as EventListener)
    const input = sq(el, "[data-field='direction'] input") as HTMLInputElement
    input.value = "horizontal"
    input.dispatchEvent(new Event("change", { bubbles: true }))
    await new Promise((r) => setTimeout(r, 0))
    expect(received).toBe("horizontal")
  })

  it("spacer選択時: type, size表示", async () => {
    el = await createElement("layout-node-inspector", {
      "node-type": "spacer", "node-size": "1/2",
    })
    expect(sq(el, "[data-field='type']")!.textContent).toContain("spacer")
    expect((sq(el, "[data-field='size'] input") as HTMLInputElement).value).toBe("1/2")
  })

  it("size変更でsize-changeイベント発火", async () => {
    el = await createElement("layout-node-inspector", {
      "node-type": "spacer", "node-size": "1/2",
    })
    let received: string | undefined
    el.addEventListener("size-change", ((e: CustomEvent) => {
      received = e.detail.size
    }) as EventListener)
    const input = sq(el, "[data-field='size'] input") as HTMLInputElement
    input.value = "1/3"
    input.dispatchEvent(new Event("change", { bubbles: true }))
    await new Promise((r) => setTimeout(r, 0))
    expect(received).toBe("1/3")
  })

  it("renders delete button when node selected", async () => {
    el = await createElement("layout-node-inspector", {
      "node-type": "item", "node-id": "a",
    })
    const btn = sq(el, "[data-action='delete']")
    expect(btn).not.toBeNull()
    expect(btn!.textContent).toContain("Delete")
  })

  it("emits node-delete on delete button click", async () => {
    el = await createElement("layout-node-inspector", {
      "node-type": "item", "node-id": "a",
    })
    let received = false
    el.addEventListener("node-delete", () => { received = true })
    const btn = sq(el, "[data-action='delete']") as HTMLElement
    btn.click()
    await new Promise((r) => setTimeout(r, 0))
    expect(received).toBe(true)
  })
})
