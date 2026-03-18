import type { LinearScale } from "../types"

export function createLinearScale(
  domainMin: number,
  domainMax: number,
  rangeMin: number,
  rangeMax: number,
): LinearScale {
  const domainSpan = domainMax - domainMin
  const rangeSpan = rangeMax - rangeMin

  function map(value: number): number {
    if (domainSpan === 0) return (rangeMin + rangeMax) / 2
    const t = (value - domainMin) / domainSpan
    return rangeMin + t * rangeSpan
  }

  function invert(value: number): number {
    if (rangeSpan === 0) return (domainMin + domainMax) / 2
    const t = (value - rangeMin) / rangeSpan
    return domainMin + t * domainSpan
  }

  function ticks(count: number): number[] {
    if (count <= 0 || domainSpan === 0) return [domainMin]
    const rawStep = domainSpan / count
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)))
    const residual = rawStep / magnitude
    let niceStep: number
    if (residual <= 1.5) niceStep = magnitude
    else if (residual <= 3.5) niceStep = 2 * magnitude
    else if (residual <= 7.5) niceStep = 5 * magnitude
    else niceStep = 10 * magnitude

    const start = Math.ceil(domainMin / niceStep) * niceStep
    const result: number[] = []
    for (let v = start; v <= domainMax + niceStep * 1e-10; v += niceStep) {
      result.push(Math.round(v * 1e12) / 1e12)
    }
    return result
  }

  return {
    map,
    invert,
    ticks,
    domain: [domainMin, domainMax],
    range: [rangeMin, rangeMax],
  }
}
