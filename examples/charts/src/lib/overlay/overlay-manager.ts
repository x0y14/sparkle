export class OverlayManager {
  readonly container: HTMLDivElement
  readonly axisXContainer: HTMLDivElement
  readonly axisYContainer: HTMLDivElement
  readonly tooltipEl: HTMLDivElement
  readonly legendEl: HTMLDivElement
  readonly titleEl: HTMLDivElement

  constructor(parent: HTMLElement) {
    this.container = document.createElement("div")
    this.container.style.cssText = "position:absolute;inset:0;pointer-events:none;overflow:hidden;"

    this.axisXContainer = document.createElement("div")
    this.axisXContainer.style.cssText = "position:absolute;bottom:0;left:0;right:0;"
    this.axisYContainer = document.createElement("div")
    this.axisYContainer.style.cssText = "position:absolute;top:0;bottom:0;left:0;"
    this.tooltipEl = document.createElement("div")
    this.tooltipEl.style.cssText = "position:absolute;display:none;pointer-events:none;z-index:10;"
    this.legendEl = document.createElement("div")
    this.legendEl.style.cssText = "position:absolute;pointer-events:auto;"
    this.titleEl = document.createElement("div")
    this.titleEl.style.cssText = "position:absolute;top:0;left:0;right:0;text-align:center;"

    this.container.append(this.axisXContainer, this.axisYContainer, this.tooltipEl, this.legendEl, this.titleEl)
    parent.appendChild(this.container)
  }

  destroy(): void { this.container.remove() }
}
