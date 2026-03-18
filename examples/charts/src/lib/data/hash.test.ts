import { describe, it, expect } from "vitest"
import { fnv1aHash, fnv1aHashIncremental } from "./hash"

describe("fnv1aHash", () => {
  it("同一入力は同一ハッシュを返す", () => {
    const buf = new Float32Array([1.0, 2.0, 3.0]).buffer
    expect(fnv1aHash(buf)).toBe(fnv1aHash(buf))
  })

  it("異なる入力は異なるハッシュを返す", () => {
    const a = new Float32Array([1.0, 2.0]).buffer
    const b = new Float32Array([1.0, 3.0]).buffer
    expect(fnv1aHash(a)).not.toBe(fnv1aHash(b))
  })

  it("空入力はFNV_OFFSETを返す", () => {
    expect(fnv1aHash(new ArrayBuffer(0))).toBe(2166136261)
  })

  it("インクリメンタル更新は全体ハッシュと一致する", () => {
    const part1 = new Float32Array([1.0, 2.0])
    const part2 = new Float32Array([3.0, 4.0])
    const full = new Float32Array([1.0, 2.0, 3.0, 4.0])
    const incremental = fnv1aHashIncremental(fnv1aHash(part1.buffer), part2.buffer)
    expect(incremental).toBe(fnv1aHash(full.buffer))
  })
})
