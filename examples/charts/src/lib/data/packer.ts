import type { DataAccessor } from "../types"

export function packXY(
  accessor: DataAccessor,
  offsetX: number,
  offsetY: number,
  startIndex: number = 0,
): Float32Array {
  const count = accessor.getCount() - startIndex
  const result = new Float32Array(count * 2)
  for (let i = 0; i < count; i++) {
    const si = startIndex + i
    result[i * 2] = accessor.getX(si) - offsetX
    result[i * 2 + 1] = accessor.getY(si) - offsetY
  }
  return result
}

export function packOHLC(
  accessor: DataAccessor,
  offsetX: number,
  offsetY: number,
  startIndex: number = 0,
): Float32Array {
  const count = accessor.getCount() - startIndex
  const result = new Float32Array(count * 5)
  for (let i = 0; i < count; i++) {
    const si = startIndex + i
    result[i * 5] = accessor.getX(si) - offsetX
    result[i * 5 + 1] = accessor.getOpen(si) - offsetY
    result[i * 5 + 2] = accessor.getHigh(si) - offsetY
    result[i * 5 + 3] = accessor.getLow(si) - offsetY
    result[i * 5 + 4] = accessor.getClose(si) - offsetY
  }
  return result
}
