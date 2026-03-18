import type { ChartConfig, NormalizedConfig, NormalizedSeries } from "../types"
import { createAccessor } from "../data/accessor"
import { computeOffset } from "../data/float32-offset"
import { resolveTheme } from "./themes"
import { assignColors } from "./color-palette"
import {
  DEFAULT_LINE_WIDTH, DEFAULT_BAR_WIDTH, DEFAULT_POINT_RADIUS,
  DEFAULT_INNER_RADIUS, DEFAULT_OUTER_RADIUS, DEFAULT_MARGINS,
  DEFAULT_MSAA_SAMPLE_COUNT, DEFAULT_TICK_COUNT, DEFAULT_FORMAT,
} from "./defaults"
import { lttb } from "../sampling/lttb"

export function normalizeConfig(config: ChartConfig): NormalizedConfig {
  const theme = resolveTheme(config.theme)
  const margins = { ...DEFAULT_MARGINS, ...config.margins }
  const colors = assignColors(config.series, theme.palette)

  const samplingThreshold = config.samplingThreshold ?? Infinity
  const normalizedSeries: NormalizedSeries[] = config.series.map((s, i) => {
    const accessor = createAccessor(s.data)
    const rawBoundsX = accessor.getBoundsX()
    const rawBoundsY = accessor.getBoundsY()
    const xValues: number[] = []
    for (let j = 0; j < accessor.getCount(); j++) xValues.push(accessor.getX(j))
    const offsetX = computeOffset(xValues)
    const yValues: number[] = []
    for (let j = 0; j < accessor.getCount(); j++) yValues.push(accessor.getY(j))
    const offsetY = computeOffset(yValues)

    let sampledIndices: number[] | null = null
    if (accessor.getCount() > samplingThreshold) {
      sampledIndices = lttb(accessor, samplingThreshold)
    }

    return {
      data: s.data,
      accessor,
      type: s.type ?? config.type,
      color: colors[i],
      label: s.label ?? `Series ${i + 1}`,
      lineWidth: s.lineWidth ?? DEFAULT_LINE_WIDTH,
      barWidth: s.barWidth ?? DEFAULT_BAR_WIDTH,
      pointRadius: s.pointRadius ?? DEFAULT_POINT_RADIUS,
      stackId: s.stackId ?? null,
      innerRadius: s.innerRadius ?? DEFAULT_INNER_RADIUS,
      outerRadius: s.outerRadius ?? DEFAULT_OUTER_RADIUS,
      visible: s.visible ?? true,
      sampledIndices,
      rawBoundsX,
      rawBoundsY,
      offsetX,
      offsetY,
    }
  })

  let xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity
  for (const s of normalizedSeries) {
    if (s.rawBoundsX.min < xMin) xMin = s.rawBoundsX.min
    if (s.rawBoundsX.max > xMax) xMax = s.rawBoundsX.max
    if (s.rawBoundsY.min < yMin) yMin = s.rawBoundsY.min
    if (s.rawBoundsY.max > yMax) yMax = s.rawBoundsY.max
  }
  if (!Number.isFinite(xMin)) { xMin = 0; xMax = 1 }
  if (!Number.isFinite(yMin)) { yMin = 0; yMax = 1 }

  return {
    type: config.type,
    series: normalizedSeries,
    xAxis: {
      label: config.xAxis?.label ?? "",
      min: config.xAxis?.min ?? xMin,
      max: config.xAxis?.max ?? xMax,
      tickCount: config.xAxis?.tickCount ?? DEFAULT_TICK_COUNT,
      format: config.xAxis?.format ?? DEFAULT_FORMAT,
    },
    yAxis: {
      label: config.yAxis?.label ?? "",
      min: config.yAxis?.min ?? yMin,
      max: config.yAxis?.max ?? yMax,
      tickCount: config.yAxis?.tickCount ?? DEFAULT_TICK_COUNT,
      format: config.yAxis?.format ?? DEFAULT_FORMAT,
    },
    theme,
    margins,
    title: config.title ?? "",
    samplingThreshold,
    zoom: config.zoom ?? true,
    tooltip: config.tooltip ?? true,
    legend: config.legend ?? true,
    msaaSampleCount: config.msaaSampleCount ?? DEFAULT_MSAA_SAMPLE_COUNT,
  }
}
