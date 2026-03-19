export type KeyAction = { kind: "delete" } | { kind: "copy" } | { kind: "paste" } | { kind: "none" }

export function resolveKeyAction(e: { key: string; metaKey: boolean; ctrlKey: boolean }): KeyAction {
  if (e.key === "Delete" || e.key === "Backspace") return { kind: "delete" }
  const mod = e.metaKey || e.ctrlKey
  if (mod && e.key === "c") return { kind: "copy" }
  if (mod && e.key === "v") return { kind: "paste" }
  return { kind: "none" }
}
