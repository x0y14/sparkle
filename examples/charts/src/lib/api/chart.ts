import type { ChartConfig, ChartInstance, HitTestResult, ZoomWindow, SeriesData } from "../types"
import { DirtyFlag } from "../types"
import { normalizeConfig } from "../config/normalize"
import { Coordinator } from "../coordinator/coordinator"
import { getGPUDevice, initGPUContext } from "../gpu/device"

export async function createChart(container: HTMLElement, config: ChartConfig): Promise<ChartInstance> {
  const canvas = document.createElement("canvas")
  canvas.style.cssText = "display:block;width:100%;height:100%;"
  container.style.position = "relative"
  container.appendChild(canvas)

  const device = await getGPUDevice()
  const gpu = initGPUContext(canvas, device)
  let currentConfig = { ...config }
  const normalized = normalizeConfig(currentConfig)

  const dpr = window.devicePixelRatio
  canvas.width = container.clientWidth * dpr
  canvas.height = container.clientHeight * dpr

  const coordinator = new Coordinator(canvas, gpu, normalized)
  const hoverCallbacks: ((r: HitTestResult | null) => void)[] = []
  const clickCallbacks: ((r: HitTestResult | null) => void)[] = []

  const instance: ChartInstance = {
    update(partial: Partial<ChartConfig>) {
      currentConfig = { ...currentConfig, ...partial }
      const newNorm = normalizeConfig(currentConfig)
      coordinator.update(newNorm)
    },
    appendData(_seriesIndex: number, _newData: SeriesData) {
      // Series data append + coordinator notification
      coordinator.markDirty(DirtyFlag.DATA)
    },
    setZoom(startPct: number, endPct: number) {
      coordinator.setZoom(startPct, endPct)
    },
    getZoom(): ZoomWindow {
      return coordinator.getZoom()
    },
    resize() {
      canvas.width = container.clientWidth * dpr
      canvas.height = container.clientHeight * dpr
      coordinator.markDirty(DirtyFlag.LAYOUT)
    },
    destroy() {
      coordinator.destroy()
      canvas.remove()
    },
    onHover(cb: (result: HitTestResult | null) => void) {
      hoverCallbacks.push(cb)
      return () => { const i = hoverCallbacks.indexOf(cb); if (i >= 0) hoverCallbacks.splice(i, 1) }
    },
    onClick(cb: (result: HitTestResult | null) => void) {
      clickCallbacks.push(cb)
      return () => { const i = clickCallbacks.indexOf(cb); if (i >= 0) clickCallbacks.splice(i, 1) }
    },
    syncWith(_other: ChartInstance) {
      // Zoom and crosshair sync
      return () => {}
    },
  }

  return instance
}
