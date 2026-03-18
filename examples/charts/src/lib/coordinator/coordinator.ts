import type { NormalizedConfig, GPUContext, PlotRect, ZoomWindow, LinearScale } from "../types"
import { DirtyFlag } from "../types"
import { computePlotRect } from "./layout"
import { createLinearScale } from "../scales/linear-scale"
import { buildTransformMatrix } from "../scales/transform-matrix"
import { ZoomState } from "../scales/zoom"
import { ZoomPanHandler } from "../interaction/zoom-pan-handler"
import { OverlayManager } from "../overlay/overlay-manager"
import { RenderPassManager } from "../gpu/render-pass"
import type { ChartRenderer } from "../gpu/renderers/base-renderer"
import { createRendererForType } from "../gpu/renderers/renderer-factory"
import { GridRenderer } from "../gpu/renderers/grid-renderer"
import { hexToRGBA } from "../config/color"

export class Coordinator {
  private config: NormalizedConfig
  private gpu: GPUContext
  private canvas: HTMLCanvasElement
  private zoom: ZoomState
  private dirty: number = DirtyFlag.LAYOUT
  private rafId: number = 0
  private plotRect: PlotRect = { x: 0, y: 0, width: 0, height: 0 }
  private zoomPanHandler: ZoomPanHandler
  private overlay: OverlayManager
  private renderers: ChartRenderer[] = []
  private gridRenderer: GridRenderer | null = null
  private renderPassManager: RenderPassManager

  constructor(canvas: HTMLCanvasElement, gpu: GPUContext, config: NormalizedConfig) {
    this.canvas = canvas
    this.gpu = gpu
    this.config = config
    this.zoom = new ZoomState()

    this.plotRect = computePlotRect(canvas.clientWidth, canvas.clientHeight, config.margins)
    this.zoomPanHandler = new ZoomPanHandler(this.zoom, this.plotRect, () => this.markDirty(DirtyFlag.INTERACTION))
    this.overlay = new OverlayManager(canvas.parentElement!)
    this.renderPassManager = new RenderPassManager(gpu, config.msaaSampleCount)

    this.initRenderers()
    this.setupEventListeners()
    this.startLoop()
  }

  private initRenderers(): void {
    this.renderers = []
    this.gridRenderer = new GridRenderer(this.gpu, this.config.msaaSampleCount)

    for (const series of this.config.series) {
      const renderer = createRendererForType(series.type, this.gpu, this.config.msaaSampleCount)
      this.renderers.push(renderer)
    }
  }

  private destroyRenderers(): void {
    for (const r of this.renderers) r.destroy()
    this.renderers = []
    this.gridRenderer?.destroy()
    this.gridRenderer = null
  }

  private setupEventListeners(): void {
    if (this.config.zoom) {
      this.canvas.addEventListener("wheel", (e) => {
        e.preventDefault()
        this.zoomPanHandler.handleWheel(e, this.canvas)
      }, { passive: false })

      this.canvas.addEventListener("pointerdown", (e) => {
        this.zoomPanHandler.handlePointerDown(e, this.canvas)
        this.canvas.setPointerCapture(e.pointerId)
      })

      this.canvas.addEventListener("pointermove", (e) => {
        this.zoomPanHandler.handlePointerMove(e, this.canvas)
      })

      this.canvas.addEventListener("pointerup", () => {
        this.zoomPanHandler.handlePointerUp()
      })
    }
  }

  private startLoop(): void {
    const tick = () => {
      if (this.dirty !== DirtyFlag.NONE) {
        this.frame()
        this.dirty = DirtyFlag.NONE
      }
      this.rafId = requestAnimationFrame(tick)
    }
    this.rafId = requestAnimationFrame(tick)
  }

  private frame(): void {
    const width = this.canvas.clientWidth
    const height = this.canvas.clientHeight
    const dpr = window.devicePixelRatio
    this.canvas.width = width * dpr
    this.canvas.height = height * dpr

    this.plotRect = computePlotRect(width, height, this.config.margins)
    this.zoomPanHandler.updatePlotRect(this.plotRect)

    const { visibleMin: xMin, visibleMax: xMax } = this.zoom.toDomain(this.config.xAxis.min, this.config.xAxis.max)
    const scaleX = createLinearScale(xMin, xMax, -1, 1)
    const scaleY = createLinearScale(this.config.yAxis.min, this.config.yAxis.max, -1, 1)

    const transformMatrix = buildTransformMatrix(
      xMin, xMax,
      this.config.yAxis.min, this.config.yAxis.max,
      this.plotRect,
      width, height,
      this.config.series[0]?.offsetX ?? 0,
      this.config.series[0]?.offsetY ?? 0,
    )

    // Update title
    if (this.config.title) {
      this.overlay.titleEl.textContent = this.config.title
      this.overlay.titleEl.style.fontFamily = this.config.theme.fontFamily
      this.overlay.titleEl.style.fontSize = `${this.config.theme.fontSize.title}px`
      this.overlay.titleEl.style.color = this.config.theme.colors.axisLabel
    }

    // Update axis labels
    this.updateAxisLabels(scaleX, scaleY)

    const uniforms = {
      transformMatrix,
      canvasWidth: width,
      canvasHeight: height,
    }

    // Grid prepare
    this.gridRenderer?.prepareGrid(this.gpu, this.config, scaleX, scaleY, this.plotRect, width, height)

    // Prepare each series renderer
    for (let i = 0; i < this.renderers.length; i++) {
      this.renderers[i].prepare(this.gpu, [this.config.series[i]], uniforms)
    }

    // 3-pass rendering
    const [bgR, bgG, bgB, bgA] = hexToRGBA(this.config.theme.colors.background)
    this.renderPassManager.render(
      this.canvas.width, this.canvas.height,
      this.renderers,
      this.gridRenderer ? [this.gridRenderer] : [],
      [],
      this.dirty,
      { r: bgR, g: bgG, b: bgB, a: bgA },
    )
  }

  private updateAxisLabels(scaleX: LinearScale, scaleY: LinearScale): void {
    const xTicks = scaleX.ticks(this.config.xAxis.tickCount)
    this.overlay.axisXContainer.innerHTML = ""
    for (const tick of xTicks) {
      const pct = ((scaleX.map(tick) + 1) / 2) * 100
      const label = document.createElement("span")
      label.style.cssText = `position:absolute;left:${pct}%;transform:translateX(-50%);font-size:${this.config.theme.fontSize.label}px;color:${this.config.theme.colors.axisLabel};font-family:${this.config.theme.fontFamily};`
      label.textContent = this.config.xAxis.format(tick)
      this.overlay.axisXContainer.appendChild(label)
    }

    const yTicks = scaleY.ticks(this.config.yAxis.tickCount)
    this.overlay.axisYContainer.innerHTML = ""
    for (const tick of yTicks) {
      const pct = ((1 - scaleY.map(tick)) / 2) * 100
      const label = document.createElement("span")
      label.style.cssText = `position:absolute;top:${pct}%;transform:translateY(-50%);font-size:${this.config.theme.fontSize.label}px;color:${this.config.theme.colors.axisLabel};font-family:${this.config.theme.fontFamily};right:4px;`
      label.textContent = this.config.yAxis.format(tick)
      this.overlay.axisYContainer.appendChild(label)
    }
  }

  markDirty(flag: number): void { this.dirty |= flag }

  update(config: NormalizedConfig): void {
    this.config = config
    this.destroyRenderers()
    this.initRenderers()
    this.markDirty(DirtyFlag.DATA | DirtyFlag.LAYOUT)
  }

  setZoom(startPct: number, endPct: number): void {
    this.zoom.setWindow(startPct, endPct)
    this.markDirty(DirtyFlag.DATA)
  }

  getZoom(): ZoomWindow {
    return this.zoom.getWindow()
  }

  destroy(): void {
    cancelAnimationFrame(this.rafId)
    this.destroyRenderers()
    this.renderPassManager.destroy()
    this.overlay.destroy()
  }
}
