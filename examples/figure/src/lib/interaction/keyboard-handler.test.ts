import { describe, it, expect } from "vitest"
import { resolveKeyAction } from "./keyboard-handler"

describe("resolveKeyAction", () => {
  it("Deleteキーでdeleteを返す", () => {
    expect(resolveKeyAction({ key: "Delete", metaKey: false, ctrlKey: false })).toEqual({ kind: "delete" })
  })
  it("Backspaceキーでdeleteを返す", () => {
    expect(resolveKeyAction({ key: "Backspace", metaKey: false, ctrlKey: false })).toEqual({ kind: "delete" })
  })
  it("Cmd+Cでcopyを返す", () => {
    expect(resolveKeyAction({ key: "c", metaKey: true, ctrlKey: false })).toEqual({ kind: "copy" })
  })
  it("Ctrl+Cでcopyを返す", () => {
    expect(resolveKeyAction({ key: "c", metaKey: false, ctrlKey: true })).toEqual({ kind: "copy" })
  })
  it("Cmd+Vでpasteを返す", () => {
    expect(resolveKeyAction({ key: "v", metaKey: true, ctrlKey: false })).toEqual({ kind: "paste" })
  })
  it("通常キーでnoneを返す", () => {
    expect(resolveKeyAction({ key: "a", metaKey: false, ctrlKey: false })).toEqual({ kind: "none" })
  })
})
