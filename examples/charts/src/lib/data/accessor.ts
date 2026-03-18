import type { SeriesData, DataAccessor, PointObject, PointTuple, ColumnarData, InterleavedData, OHLCObject } from "../types"

type DataFormat = "object" | "tuple" | "columnar" | "interleaved" | "ohlc"

export function detectFormat(data: SeriesData): DataFormat {
  if (!data || (Array.isArray(data) && data.length === 0)) return "object"
  if (Array.isArray(data)) {
    const first = data[0]
    if (Array.isArray(first)) return "tuple"
    if (typeof first === "object" && first !== null && "open" in first) return "ohlc"
    return "object"
  }
  if ("buffer" in data && "stride" in data) return "interleaved"
  if ("x" in data && "y" in data) return "columnar"
  return "object"
}

export function createAccessor(data: SeriesData): DataAccessor {
  const format = detectFormat(data)

  switch (format) {
    case "object": return createObjectAccessor(data as PointObject[])
    case "tuple": return createTupleAccessor(data as PointTuple[])
    case "columnar": return createColumnarAccessor(data as ColumnarData)
    case "interleaved": return createInterleavedAccessor(data as InterleavedData)
    case "ohlc": return createOHLCAccessor(data as OHLCObject[])
  }
}

function createObjectAccessor(data: PointObject[]): DataAccessor {
  return {
    getCount: () => data.length,
    getX: (i) => data[i].x,
    getY: (i) => data[i].y,
    getOpen: (i) => data[i].y,
    getHigh: (i) => data[i].y,
    getLow: (i) => data[i].y,
    getClose: (i) => data[i].y,
    getSize: (i) => data[i].size ?? 4,
    getBoundsX: () => computeBounds(data.length, (i) => data[i].x),
    getBoundsY: () => computeBounds(data.length, (i) => data[i].y),
    hasNull: (i) => Number.isNaN(data[i].x) || Number.isNaN(data[i].y),
  }
}

function createTupleAccessor(data: PointTuple[]): DataAccessor {
  return {
    getCount: () => data.length,
    getX: (i) => data[i][0],
    getY: (i) => data[i][1],
    getOpen: (i) => data[i][1],
    getHigh: (i) => data[i][1],
    getLow: (i) => data[i][1],
    getClose: (i) => data[i][1],
    getSize: () => 4,
    getBoundsX: () => computeBounds(data.length, (i) => data[i][0]),
    getBoundsY: () => computeBounds(data.length, (i) => data[i][1]),
    hasNull: (i) => Number.isNaN(data[i][0]) || Number.isNaN(data[i][1]),
  }
}

function createColumnarAccessor(data: ColumnarData): DataAccessor {
  return {
    getCount: () => data.x.length,
    getX: (i) => data.x[i],
    getY: (i) => data.y[i],
    getOpen: (i) => data.y[i],
    getHigh: (i) => data.y[i],
    getLow: (i) => data.y[i],
    getClose: (i) => data.y[i],
    getSize: () => 4,
    getBoundsX: () => computeBounds(data.x.length, (i) => data.x[i]),
    getBoundsY: () => computeBounds(data.y.length, (i) => data.y[i]),
    hasNull: (i) => Number.isNaN(data.x[i]) || Number.isNaN(data.y[i]),
  }
}

function createInterleavedAccessor(data: InterleavedData): DataAccessor {
  const count = Math.floor(data.buffer.length / data.stride)
  return {
    getCount: () => count,
    getX: (i) => data.buffer[i * data.stride],
    getY: (i) => data.buffer[i * data.stride + 1],
    getOpen: (i) => data.buffer[i * data.stride + 1],
    getHigh: (i) => data.buffer[i * data.stride + 1],
    getLow: (i) => data.buffer[i * data.stride + 1],
    getClose: (i) => data.buffer[i * data.stride + 1],
    getSize: (i) => data.stride > 2 ? data.buffer[i * data.stride + 2] : 4,
    getBoundsX: () => computeBounds(count, (i) => data.buffer[i * data.stride]),
    getBoundsY: () => computeBounds(count, (i) => data.buffer[i * data.stride + 1]),
    hasNull: (i) => Number.isNaN(data.buffer[i * data.stride]) || Number.isNaN(data.buffer[i * data.stride + 1]),
  }
}

function createOHLCAccessor(data: OHLCObject[]): DataAccessor {
  return {
    getCount: () => data.length,
    getX: (i) => data[i].time,
    getY: (i) => data[i].close,
    getOpen: (i) => data[i].open,
    getHigh: (i) => data[i].high,
    getLow: (i) => data[i].low,
    getClose: (i) => data[i].close,
    getSize: () => 4,
    getBoundsX: () => computeBounds(data.length, (i) => data[i].time),
    getBoundsY: () => {
      let min = Infinity, max = -Infinity
      for (let i = 0; i < data.length; i++) {
        if (data[i].low < min) min = data[i].low
        if (data[i].high > max) max = data[i].high
      }
      return { min, max }
    },
    hasNull: (i) => Number.isNaN(data[i].time) || Number.isNaN(data[i].close),
  }
}

function computeBounds(count: number, getValue: (i: number) => number): { min: number; max: number } {
  let min = Infinity, max = -Infinity
  for (let i = 0; i < count; i++) {
    const v = getValue(i)
    if (Number.isNaN(v)) continue
    if (v < min) min = v
    if (v > max) max = v
  }
  return { min, max }
}
