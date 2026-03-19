import type { Figure, FigureId } from "../types"

export type FigureStoreListener = () => void

export class FigureStore {
  private figures: Figure[] = []
  private selectedId: FigureId | null = null
  private listeners: Set<FigureStoreListener> = new Set()

  getAll(): Figure[] {
    return this.figures
  }

  get(id: FigureId): Figure | undefined {
    return this.figures.find(f => f.id === id)
  }

  getSelected(): Figure | null {
    if (this.selectedId === null) return null
    return this.get(this.selectedId) ?? null
  }

  getSelectedId(): FigureId | null {
    return this.selectedId
  }

  add(figure: Figure): void {
    this.figures.push(figure)
    this.notify()
  }

  update(id: FigureId, patch: Partial<Omit<Figure, "id" | "kind">>): void {
    const fig = this.get(id)
    if (!fig) return
    Object.assign(fig, patch)
    this.notify()
  }

  remove(id: FigureId): void {
    this.figures = this.figures.filter(f => f.id !== id)
    if (this.selectedId === id) {
      this.selectedId = null
    }
    this.notify()
  }

  select(id: FigureId | null): void {
    this.selectedId = id
    if (id !== null) {
      const idx = this.figures.findIndex(f => f.id === id)
      if (idx >= 0 && idx < this.figures.length - 1) {
        const [fig] = this.figures.splice(idx, 1)
        this.figures.push(fig)
      }
    }
    this.notify()
  }

  subscribe(listener: FigureStoreListener): () => void {
    this.listeners.add(listener)
    return () => { this.listeners.delete(listener) }
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener()
    }
  }
}
