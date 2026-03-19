import { describe, it, expect, vi } from "vitest"
import { FigureStore } from "./figure-store"
import type { Figure } from "../types"

function makeFigure(id: string, x = 0, y = 0): Figure {
  return { id, kind: "rect", x, y, width: 60, height: 40, fill: [1,0,0,1] }
}

describe("FigureStore", () => {
  it("初期状態は空", () => {
    const store = new FigureStore()
    expect(store.getAll()).toEqual([])
    expect(store.getSelected()).toBeNull()
    expect(store.getSelectedId()).toBeNull()
  })

  it("addで追加、getAllで取得できる", () => {
    const store = new FigureStore()
    store.add(makeFigure("a"))
    expect(store.getAll()).toHaveLength(1)
    expect(store.get("a")!.id).toBe("a")
  })

  it("updateでプロパティを変更できる", () => {
    const store = new FigureStore()
    store.add(makeFigure("a"))
    store.update("a", { x: 50, y: 60 })
    expect(store.get("a")!.x).toBe(50)
    expect(store.get("a")!.y).toBe(60)
  })

  it("存在しないidのupdateは無視される", () => {
    const store = new FigureStore()
    store.update("missing", { x: 50 })
  })

  it("removeで削除される", () => {
    const store = new FigureStore()
    store.add(makeFigure("a"))
    store.remove("a")
    expect(store.getAll()).toHaveLength(0)
    expect(store.get("a")).toBeUndefined()
  })

  it("selectで選択状態が設定される", () => {
    const store = new FigureStore()
    store.add(makeFigure("a"))
    store.select("a")
    expect(store.getSelectedId()).toBe("a")
    expect(store.getSelected()!.id).toBe("a")
  })

  it("select(null)で選択解除", () => {
    const store = new FigureStore()
    store.add(makeFigure("a"))
    store.select("a")
    store.select(null)
    expect(store.getSelectedId()).toBeNull()
    expect(store.getSelected()).toBeNull()
  })

  it("選択中の図形をremoveすると選択解除される", () => {
    const store = new FigureStore()
    store.add(makeFigure("a"))
    store.select("a")
    store.remove("a")
    expect(store.getSelectedId()).toBeNull()
  })

  it("selectで図形がz-order最上位に移動する", () => {
    const store = new FigureStore()
    store.add(makeFigure("a"))
    store.add(makeFigure("b"))
    store.add(makeFigure("c"))
    store.select("a")
    const all = store.getAll()
    expect(all[all.length - 1].id).toBe("a")
  })

  it("subscribeしたリスナーがadd/update/remove/selectで呼ばれる", () => {
    const store = new FigureStore()
    const listener = vi.fn()
    store.subscribe(listener)
    store.add(makeFigure("a"))
    expect(listener).toHaveBeenCalledTimes(1)
    store.update("a", { x: 10 })
    expect(listener).toHaveBeenCalledTimes(2)
    store.select("a")
    expect(listener).toHaveBeenCalledTimes(3)
    store.remove("a")
    expect(listener).toHaveBeenCalledTimes(4)
  })

  it("unsubscribeでリスナーが解除される", () => {
    const store = new FigureStore()
    const listener = vi.fn()
    const unsub = store.subscribe(listener)
    unsub()
    store.add(makeFigure("a"))
    expect(listener).not.toHaveBeenCalled()
  })
})
