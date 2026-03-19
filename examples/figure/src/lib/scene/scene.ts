import type { GPUContext, Figure } from "../types"
import { FigureStore } from "../figures/figure-store"
import { snap, GRID_SIZE } from "../interaction/snap"
import { hitTest } from "../interaction/hit-test"
import { beginDrag, moveDrag, type DragState } from "../interaction/drag-handler"
import { beginResize, moveResize, type ResizeState } from "../interaction/resize-handler"
import { createClipboard, copyFigure, pasteFigure } from "../interaction/clipboard"
import { resolveKeyAction } from "../interaction/keyboard-handler"
import type { FigureRenderer } from "../gpu/renderers/base-renderer"
import { RenderPassManager } from "../gpu/render-pass"
import { GridRenderer, computeGridLines } from "../gpu/renderers/grid-renderer"
import { RectRenderer, packFiguresToFloat32 } from "../gpu/renderers/rect-renderer"
import { SelectionRenderer, packSelectionToFloat32 } from "../gpu/renderers/selection-renderer"

const SAMPLE_COUNT = 4

let nextId = 1
function generateId(): string {
  return `fig_${nextId++}`
}

export class Scene {
  private canvas: HTMLCanvasElement
  private gpu: GPUContext
  private store: FigureStore
  private renderPassManager: RenderPassManager
  private gridRenderer: GridRenderer
  private rectRenderer: RectRenderer
  private selectionRenderer: SelectionRenderer
  private clipboard = createClipboard()
  private dragState: DragState | null = null
  private resizeState: ResizeState | null = null
  private animFrameId: number = 0
  private unsub: () => void

  private onMouseDown = (e: MouseEvent) => this.handleMouseDown(e)
  private onMouseMove = (e: MouseEvent) => this.handleMouseMove(e)
  private onMouseUp = () => this.handleMouseUp()
  private onKeyDown = (e: KeyboardEvent) => this.handleKeyDown(e)
  private onAddRect = () => this.addRect()

  constructor(canvas: HTMLCanvasElement, gpu: GPUContext, store: FigureStore) {
    this.canvas = canvas
    this.gpu = gpu
    this.store = store
    this.renderPassManager = new RenderPassManager(gpu, SAMPLE_COUNT)
    this.gridRenderer = new GridRenderer(gpu, SAMPLE_COUNT)
    this.rectRenderer = new RectRenderer(gpu, SAMPLE_COUNT)
    this.selectionRenderer = new SelectionRenderer(gpu, SAMPLE_COUNT)

    canvas.addEventListener("mousedown", this.onMouseDown)
    canvas.addEventListener("mousemove", this.onMouseMove)
    canvas.addEventListener("mouseup", this.onMouseUp)
    window.addEventListener("keydown", this.onKeyDown)
    window.addEventListener("figure:add-rect", this.onAddRect)

    this.unsub = store.subscribe(() => this.requestRender())
    this.requestRender()
  }

  addRect(): void {
    const id = generateId()
    const x = snap(100 + Math.random() * 400)
    const y = snap(100 + Math.random() * 300)
    const figure: Figure = {
      id,
      kind: "rect",
      x,
      y,
      width: 100,
      height: 80,
      fill: [
        0.2 + Math.random() * 0.6,
        0.2 + Math.random() * 0.6,
        0.6 + Math.random() * 0.4,
        1,
      ],
    }
    this.store.add(figure)
    this.store.select(id)
  }

  private handleMouseDown(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect()
    const px = e.clientX - rect.left
    const py = e.clientY - rect.top
    const target = hitTest(this.store.getAll(), this.store.getSelectedId(), px, py)

    if (target.kind === "handle") {
      const fig = this.store.get(target.figureId)
      if (fig) {
        this.resizeState = beginResize(fig, target.side, px, py)
      }
    } else if (target.kind === "figure") {
      this.store.select(target.figureId)
      const fig = this.store.get(target.figureId)
      if (fig) {
        this.dragState = beginDrag(fig, px, py)
      }
    } else {
      this.store.select(null)
    }
  }

  private handleMouseMove(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect()
    const px = e.clientX - rect.left
    const py = e.clientY - rect.top

    if (this.resizeState) {
      const result = moveResize(this.resizeState, px, py)
      this.store.update(this.resizeState.figureId, result)
    } else if (this.dragState) {
      const pos = moveDrag(this.dragState, px, py)
      this.store.update(this.dragState.figureId, pos)
    }
  }

  private handleMouseUp(): void {
    this.dragState = null
    this.resizeState = null
  }

  private handleKeyDown(e: KeyboardEvent): void {
    const action = resolveKeyAction(e)
    switch (action.kind) {
      case "delete": {
        const id = this.store.getSelectedId()
        if (id) this.store.remove(id)
        break
      }
      case "copy": {
        const fig = this.store.getSelected()
        if (fig) copyFigure(this.clipboard, fig)
        break
      }
      case "paste": {
        const data = pasteFigure(this.clipboard, snap(200), snap(200))
        if (data) {
          const id = generateId()
          this.store.add({ ...data, id })
          this.store.select(id)
        }
        break
      }
    }
  }

  private requestRender(): void {
    if (this.animFrameId) return
    this.animFrameId = requestAnimationFrame(() => {
      this.animFrameId = 0
      this.renderFrame()
    })
  }

  private renderFrame(): void {
    const cssRect = this.canvas.getBoundingClientRect()
    const cssW = cssRect.width
    const cssH = cssRect.height
    if (cssW === 0 || cssH === 0) return

    const figures = this.store.getAll()
    const selected = this.store.getSelected()

    // rendererにはCSSピクセルサイズを渡す（図形座標空間と一致）
    const gridData = computeGridLines(cssW, cssH, GRID_SIZE)
    this.gridRenderer.prepare(this.gpu, gridData, cssW, cssH)

    const rectData = packFiguresToFloat32(figures)
    this.rectRenderer.prepare(this.gpu, rectData, cssW, cssH)

    const renderers: FigureRenderer[] = [this.gridRenderer, this.rectRenderer]

    if (selected) {
      const selData = packSelectionToFloat32(selected)
      this.selectionRenderer.prepare(this.gpu, selData, cssW, cssH)
      renderers.push(this.selectionRenderer)
    }

    // renderPassManagerには物理ピクセルサイズを渡す（MSAAテクスチャサイズ）
    const physW = this.canvas.width
    const physH = this.canvas.height
    this.renderPassManager.render(physW, physH, renderers, { r: 0.1, g: 0.1, b: 0.18, a: 1 })
  }

  destroy(): void {
    this.unsub()
    cancelAnimationFrame(this.animFrameId)
    this.canvas.removeEventListener("mousedown", this.onMouseDown)
    this.canvas.removeEventListener("mousemove", this.onMouseMove)
    this.canvas.removeEventListener("mouseup", this.onMouseUp)
    window.removeEventListener("keydown", this.onKeyDown)
    window.removeEventListener("figure:add-rect", this.onAddRect)
    this.gridRenderer.destroy()
    this.rectRenderer.destroy()
    this.selectionRenderer.destroy()
    this.renderPassManager.destroy()
  }
}
