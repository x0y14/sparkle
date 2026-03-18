export function computeOffset(values: ArrayLike<number>): number {
  if (values.length === 0) return 0
  return values[0]
}

export function applyOffset(values: ArrayLike<number>, offset: number): Float32Array {
  const result = new Float32Array(values.length)
  for (let i = 0; i < values.length; i++) {
    result[i] = values[i] - offset
  }
  return result
}
