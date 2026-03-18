import type { ChartConfig, ChartInstance, HitTestResult, ZoomWindow, SeriesData } from "../types"
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

  const instance: ChartInstance & { __coordinator: Coordinator } = {
    __coordinator: coordinator,
    update(partial: Partial<ChartConfig>) {
      currentConfig = { ...currentConfig, ...partial }
      const newNorm = normalizeConfig(currentConfig)
      coordinator.update(newNorm)
    },
    appendData(seriesIndex: number, newData: SeriesData) {
      coordinator.appendData(seriesIndex, newData)
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
      coordinator.markDirty(1 << 3) // DirtyFlag.LAYOUT
    },
    destroy() {
      coordinator.destroy()
      canvas.remove()
    },
    onHover(cb: (result: HitTestResult | null) => void) {
      return coordinator.onHover(cb)
    },
    onClick(cb: (result: HitTestResult | null) => void) {
      return coordinator.onClick(cb)
    },
    syncWith(other: ChartInstance) {
      const otherCoord = (other as any).__coordinator as Coordinator | undefined
      if (!otherCoord) return () => {}
      const unsub = otherCoord.onZoomChange(() => {
        const z = other.getZoom()
        coordinator.setZoom(z.startPct, z.endPct)
      })
      return unsub
    },
  }

  return instance
}
