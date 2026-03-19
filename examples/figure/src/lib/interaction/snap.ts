export const GRID_SIZE = 20

export function snap(value: number): number {
  const result = Math.round(value / GRID_SIZE) * GRID_SIZE
  return result === 0 ? 0 : result
}
