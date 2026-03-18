const FNV_OFFSET = 2166136261
const FNV_PRIME = 16777619

export function fnv1aHash(data: ArrayBuffer, seed: number = FNV_OFFSET): number {
  const view = new Uint8Array(data)
  let hash = seed
  for (let i = 0; i < view.length; i++) {
    hash ^= view[i]
    hash = Math.imul(hash, FNV_PRIME) >>> 0
  }
  return hash >>> 0
}

export function fnv1aHashIncremental(prevHash: number, appendData: ArrayBuffer): number {
  return fnv1aHash(appendData, prevHash)
}
